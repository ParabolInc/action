import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {SuggestedActionTypeEnum} from '../../../client/types/constEnums'
import {DISCUSS} from 'parabol-client/utils/constants'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import getRethink from '../../database/rethinkDriver'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import MeetingMember from '../../database/types/MeetingMember'
import TimelineEventRetroComplete from '../../database/types/TimelineEventRetroComplete'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {DataLoaderWorker, GQLContext} from '../graphql'
import EndRetrospectivePayload from '../types/EndRetrospectivePayload'
import sendMeetingEndToSegment from './helpers/endMeeting/sendMeetingEndToSegment'
import sendNewMeetingSummary from './helpers/endMeeting/sendNewMeetingSummary'
import {endSlackMeeting} from './helpers/notifySlack'
import removeEmptyTasks from './helpers/removeEmptyTasks'

const finishRetroMeeting = async (meeting: MeetingRetrospective, dataLoader: DataLoaderWorker) => {
  const {id: meetingId} = meeting
  const r = await getRethink()
  const [reflectionGroups, reflections] = await Promise.all([
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  ])
  const reflectionGroupIds = reflectionGroups.map(({id}) => id)

  await r
    .table('NewMeeting')
    .get(meetingId)
    .update(
      {
        commentCount: (r
          .table('Comment')
          .getAll(r.args(reflectionGroupIds), {index: 'threadId'})
          .filter({isActive: true})
          .count()
          .default(0) as unknown) as number,
        taskCount: (r
          .table('Task')
          .getAll(r.args(reflectionGroupIds), {index: 'threadId'})
          .count()
          .default(0) as unknown) as number,
        topicCount: reflectionGroupIds.length,
        reflectionCount: reflections.length
      },
      {nonAtomic: true}
    )
    .run()
}

export default {
  type: new GraphQLNonNull(EndRetrospectivePayload),
  description: 'Finish a retrospective meeting',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting to end'
    }
  },
  async resolve(_source, {meetingId}, context: GQLContext) {
    const {authToken, socketId: mutatorId, dataLoader} = context
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = (await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
      .run()) as MeetingRetrospective | null
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, facilitatorStageId, phases, teamId} = meeting

    // VALIDATION
    if (!isTeamMember(authToken, teamId) && authToken.rol !== 'su') {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

    // RESOLUTION
    const currentStageRes = findStageById(phases, facilitatorStageId)
    if (!currentStageRes) {
      return standardError(new Error('Cannot find facilitator stage'), {userId: viewerId})
    }
    const {stage} = currentStageRes
    const phase = getMeetingPhase(phases)
    stage.isComplete = true
    stage.endAt = now

    const completedRetrospective = ((await r
      .table('NewMeeting')
      .get(meetingId)
      .update(
        {
          endedAt: now,
          phases
        },
        {returnChanges: true}
      )('changes')(0)('new_val')
      .default(null)
      .run()) as unknown) as MeetingRetrospective

    if (!completedRetrospective) {
      return standardError(new Error('Completed check-in meeting does not exist'), {
        userId: viewerId
      })
    }

    // remove any empty tasks
    const {templateId} = completedRetrospective
    const [meetingMembers, team, teamMembers, removedTaskIds, template] = await Promise.all([
      dataLoader.get('meetingMembersByMeetingId').load(meetingId),
      dataLoader.get('teams').load(teamId),
      dataLoader.get('teamMembersByTeamId').load(teamId),
      removeEmptyTasks(meetingId),
      dataLoader.get('meetingTemplates').load(templateId)
    ])
    endSlackMeeting(meetingId, teamId, dataLoader).catch(console.log)
    finishRetroMeeting(completedRetrospective, dataLoader)
    sendMeetingEndToSegment(completedRetrospective, meetingMembers as MeetingMember[], template)
    sendNewMeetingSummary(completedRetrospective, context).catch(console.log)
    const events = teamMembers.map(
      (teamMember) =>
        new TimelineEventRetroComplete({
          userId: teamMember.userId,
          teamId,
          orgId: team.orgId,
          meetingId
        })
    )
    const timelineEventId = events[0].id as string
    await r
      .table('TimelineEvent')
      .insert(events)
      .run()
    if (team.isOnboardTeam) {
      const teamLeadUserId = await r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isLead: true})
        .nth(0)('userId')
        .run()

      const removedSuggestedActionId = await removeSuggestedAction(
        teamLeadUserId,
        SuggestedActionTypeEnum.tryRetroMeeting
      )
      if (removedSuggestedActionId) {
        publish(
          SubscriptionChannel.NOTIFICATION,
          teamLeadUserId,
          'EndRetrospectiveSuccess',
          {removedSuggestedActionId},
          subOptions
        )
      }
    }

    const data = {
      meetingId,
      teamId,
      isKill: phase.phaseType !== DISCUSS,
      removedTaskIds,
      timelineEventId
    }
    publish(SubscriptionChannel.TEAM, teamId, 'EndRetrospectiveSuccess', data, subOptions)

    return data
  }
}
