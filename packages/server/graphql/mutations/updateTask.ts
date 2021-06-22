import {GraphQLNonNull} from 'graphql'
import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import normalizeRawDraftJS from 'parabol-client/validation/normalizeRawDraftJS'
import getRethink from '../../database/rethinkDriver'
import Task, {AreaEnum as TAreaEnum, TaskStatusEnum} from '../../database/types/Task'
import TeamMember from '../../database/types/TeamMember'
import generateUID from '../../generateUID'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AreaEnum from '../types/AreaEnum'
import UpdateTaskInput from '../types/UpdateTaskInput'
import UpdateTaskPayload from '../types/UpdateTaskPayload'
import {validateTaskUserId} from './createTask'
import getUsersToIgnore from './helpers/getUsersToIgnore'
import publishChangeNotifications from './helpers/publishChangeNotifications'

const DEBOUNCE_TIME = ms('5m')

type UpdateTaskInput = {
  id: string
  content?: string | null
  sortOrder?: number | null
  status?: TaskStatusEnum | null
  teamId?: string | null
  userId?: string | null
}
type UpdateTaskMutationVariables = {
  updatedTask: UpdateTaskInput
  area?: TAreaEnum | null
}
export default {
  type: UpdateTaskPayload,
  description: 'Update a task with a change in content, ownership, or status',
  args: {
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    },
    updatedTask: {
      type: new GraphQLNonNull(UpdateTaskInput),
      description: 'the updated task including the id, and at least one other field'
    }
  },
  async resolve(
    _source,
    {updatedTask}: UpdateTaskMutationVariables,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // VALIDATION
    const {
      id: taskId,
      teamId: inputTeamId,
      userId: inputUserId,
      status,
      sortOrder,
      content
    } = updatedTask
    const validContent = normalizeRawDraftJS(content)
    const task = await r
      .table('Task')
      .get(taskId)
      .run()
    if (!task) {
      return {error: {message: 'Task not found'}}
    }
    const {teamId, userId} = task
    const nextUserId = inputUserId === undefined ? userId : inputUserId
    const nextTeamId = inputTeamId || teamId
    if (!isTeamMember(authToken, teamId) || !isTeamMember(authToken, nextTeamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (inputTeamId || inputUserId) {
      const error = await validateTaskUserId(nextUserId, nextTeamId, dataLoader)
      if (error) {
        return standardError(new Error('Invalid user ID'), {userId: viewerId})
      }
    }
    // RESOLUTION
    const isSortOrderUpdate =
      updatedTask.sortOrder !== undefined && Object.keys(updatedTask).length === 2
    const nextTask = new Task({
      ...task,
      teamId: nextTeamId,
      userId: nextUserId,
      status: status || task.status,
      sortOrder: sortOrder || task.sortOrder,
      content: content ? validContent : task.content,
      plaintextContent: content ? extractTextFromDraftString(validContent) : task.plaintextContent,
      updatedAt: isSortOrderUpdate ? task.updatedAt : now
    })

    let taskHistory
    if (!isSortOrderUpdate) {
      // if this is anything but a sort update, log it to history
      const mergeDoc = {
        content: nextTask.content,
        taskId,
        status,
        userId: nextTask.userId,
        teamId: nextTask.teamId,
        updatedAt: now,
        tags: nextTask.tags
      }
      taskHistory = r
        .table('TaskHistory')
        .between([taskId, r.minval], [taskId, r.maxval], {
          index: 'taskIdUpdatedAt'
        })
        .orderBy({index: 'taskIdUpdatedAt'})
        .nth(-1)
        .default({updatedAt: r.epochTime(0)})
        .do((lastDoc) => {
          return r.branch(
            lastDoc('updatedAt').gt(r.epochTime((now.getTime() - DEBOUNCE_TIME) / 1000)),
            r
              .table('TaskHistory')
              .get(lastDoc('id'))
              .update(mergeDoc),
            r.table('TaskHistory').insert(lastDoc.merge(mergeDoc, {id: generateUID()}))
          )
        })
    }
    const {newTask, teamMembers} = await r({
      newTask: (r
        .table('Task')
        .get(taskId)
        .update(nextTask, {returnChanges: true})('changes')(0)('new_val')
        .default(null) as unknown) as Task,
      history: taskHistory,
      teamMembers: (r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isNotRemoved: true
        })
        .coerceTo('array') as unknown) as TeamMember[]
    }).run()
    // TODO: get users in the same location
    const usersToIgnore = await getUsersToIgnore(viewerId, teamId)
    if (!newTask) return standardError(new Error('Already updated task'), {userId: viewerId})

    // send task updated messages
    const isPrivate = newTask.tags.includes('private')
    const wasPrivate = task.tags.includes('private')
    const isPrivatized = isPrivate && !wasPrivate
    const isPublic = !isPrivate || isPrivatized

    // get notification diffs
    const {notificationsToAdd} = await publishChangeNotifications(
      newTask,
      task,
      viewerId,
      usersToIgnore
    )
    const data = {
      isPrivatized,
      taskId,
      notificationsToAdd
    }
    teamMembers.forEach(({userId}) => {
      if (isPublic || userId === newTask.userId || userId === viewerId) {
        publish(SubscriptionChannel.TASK, userId, 'UpdateTaskPayload', data, subOptions)
      }
    })

    return data
  }
}
