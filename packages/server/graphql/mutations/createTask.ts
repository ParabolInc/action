import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getTypeFromEntityMap from 'parabol-client/utils/draftjs/getTypeFromEntityMap'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import normalizeRawDraftJS from 'parabol-client/validation/normalizeRawDraftJS'
import getRethink from '../../database/rethinkDriver'
import NotificationTaskInvolves from '../../database/types/NotificationTaskInvolves'
import Task, {TaskStatusEnum} from '../../database/types/Task'
import TeamMember from '../../database/types/TeamMember'
import generateUID from '../../generateUID'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish, {SubOptions} from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {DataLoaderWorker, GQLContext} from '../graphql'
import AreaEnum from '../types/AreaEnum'
import CreateTaskInput from '../types/CreateTaskInput'
import CreateTaskPayload from '../types/CreateTaskPayload'
import getUsersToIgnore from './helpers/getUsersToIgnore'
import validateThreadableThreadSourceId from './validateThreadableThreadSourceId'
import {ThreadSourceEnum} from '../../database/types/ThreadSource'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'

const validateTaskAgendaItemId = async (
  threadSource: ThreadSourceEnum | null,
  threadId: string | null | undefined,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const agendaItemId = threadSource === 'AGENDA_ITEM' ? threadId : undefined
  if (agendaItemId) {
    const agendaItem = await dataLoader.get('agendaItems').load(agendaItemId)
    if (!agendaItem || agendaItem.teamId !== teamId) {
      return 'Invalid agenda item ID'
    }
  }
  return undefined
}

const validateTaskMeetingId = async (
  meetingId: string | null | undefined,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  if (meetingId) {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting || meeting.teamId !== teamId) {
      return 'Invalid meeting ID'
    }
  }
  return undefined
}

export const validateTaskUserId = async (
  userId: string | null | undefined,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  if (!userId) return undefined
  const teamMemberId = toTeamMemberId(teamId, userId)
  const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
  return teamMember ? undefined : 'Invalid user ID'
}

const sendToSentryTaskCreated = async (
  meetingId: string | null | undefined,
  viewerId: string,
  teamId: string,
  isReply: boolean,
  dataLoader: DataLoaderWorker
) => {
  let isAsync
  if (meetingId) {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) return
    const {phases} = meeting
    const discussPhase = phases.find(
      ({phaseType}: {phaseType: NewMeetingPhaseTypeEnum}) =>
        phaseType === 'discuss' || phaseType === 'agendaitems'
    )
    if (discussPhase) {
      const {stages} = discussPhase
      isAsync = stages.some((stage) => stage.isAsync)
    }
  }

  segmentIo.track({
    userId: viewerId,
    event: 'Task added',
    properties: {
      meetingId,
      teamId,
      isAsync,
      isReply
    }
  })
}

const handleAddTaskNotifications = async (
  teamMembers: any[],
  task: Task,
  viewerId: string,
  teamId: string,
  subOptions: SubOptions
) => {
  const r = await getRethink()
  const {id: taskId, content, tags, userId} = task
  const usersIdsToIgnore = await getUsersToIgnore(viewerId, teamId)

  // Handle notifications
  // Almost always you start out with a blank card assigned to you (except for filtered team dash)
  const changeAuthorId = toTeamMemberId(teamId, viewerId)
  const notificationsToAdd = [] as NotificationTaskInvolves[]
  if (userId && viewerId !== userId && !usersIdsToIgnore.includes(userId)) {
    notificationsToAdd.push(
      new NotificationTaskInvolves({
        involvement: 'ASSIGNEE',
        taskId,
        changeAuthorId,
        teamId,
        userId
      })
    )
  }

  const {entityMap} = JSON.parse(content)
  getTypeFromEntityMap('MENTION', entityMap)
    .filter(
      (mention) => mention !== viewerId && mention !== userId && !usersIdsToIgnore.includes(mention)
    )
    .forEach((mentioneeUserId) => {
      notificationsToAdd.push(
        new NotificationTaskInvolves({
          userId: mentioneeUserId,
          involvement: 'MENTIONEE',
          taskId,
          changeAuthorId,
          teamId
        })
      )
    })
  const data = {taskId, notifications: notificationsToAdd}

  if (notificationsToAdd.length) {
    // don't await to speed up task creation
    r.table('Notification')
      .insert(notificationsToAdd)
      .run()
    notificationsToAdd.forEach((notification) => {
      publish(
        SubscriptionChannel.NOTIFICATION,
        notification.userId,
        'CreateTaskPayload',
        data,
        subOptions
      )
    })
  }

  const isPrivate = tags.includes('private')
  teamMembers.forEach((teamMember) => {
    if (!isPrivate || teamMember.userId === userId) {
      publish(SubscriptionChannel.TASK, teamMember.userId, 'CreateTaskPayload', data, subOptions)
    }
  })
}

export type CreateTaskInput = {
  newTask: {
    content?: string | null
    plaintextContent?: string | null
    meetingId?: string | null
    threadId?: string | null
    threadSource?: ThreadSourceEnum | null
    threadSortOrder?: number | null
    threadParentId?: string | null
    sortOrder?: number | null
    status: TaskStatusEnum
    teamId: string
    userId?: string | null
  }
}

export default {
  type: GraphQLNonNull(CreateTaskPayload),
  description: 'Create a new task, triggering a CreateCard for other viewers',
  args: {
    newTask: {
      type: new GraphQLNonNull(CreateTaskInput),
      description: 'The new task including an id, status, and type, and teamMemberId'
    },
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    }
  },
  async resolve(
    _source,
    {newTask}: CreateTaskInput,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const viewerId = getUserId(authToken)

    const {
      meetingId,
      threadId,
      threadParentId,
      threadSortOrder,
      sortOrder,
      status,
      teamId,
      userId
    } = newTask
    const threadSource = newTask.threadSource as ThreadSourceEnum | null
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    const errors = await Promise.all([
      // threadParentId not validated because if it's invalid it simply won't appear
      validateTaskAgendaItemId(threadSource, threadId, teamId, dataLoader),
      validateThreadableThreadSourceId(threadSource, threadId, meetingId, dataLoader),
      validateTaskMeetingId(meetingId, teamId, dataLoader),
      validateTaskUserId(userId, teamId, dataLoader)
    ])
    const firstError = errors.find(Boolean)
    if (firstError) {
      return standardError(new Error(firstError), {userId: viewerId})
    }

    // RESOLUTION
    const content = normalizeRawDraftJS(newTask.content)
    const task = new Task({
      content,
      createdBy: viewerId,
      meetingId,
      sortOrder,
      status,
      teamId,
      threadId,
      threadSource,
      threadSortOrder,
      threadParentId,
      userId
    })
    const {id: taskId, updatedAt} = task
    const history = {
      id: generateUID(),
      content,
      taskId,
      status,
      teamId,
      userId,
      updatedAt
    }

    const {teamMembers} = await r({
      task: r.table('Task').insert(task),
      history: r.table('TaskHistory').insert(history),
      teamMembers: (r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isNotRemoved: true
        })
        .coerceTo('array') as unknown) as TeamMember[]
    }).run()

    handleAddTaskNotifications(teamMembers, task, viewerId, teamId, {
      operationId,
      mutatorId
    }).catch()

    sendToSentryTaskCreated(meetingId, viewerId, teamId, !!threadParentId, dataLoader).catch()
    return {taskId}
  }
}
