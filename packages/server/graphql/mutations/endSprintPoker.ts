import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import getRethink from '../../database/rethinkDriver'
import Meeting from '../../database/types/Meeting'
import MeetingMember from '../../database/types/MeetingMember'
import MeetingPoker from '../../database/types/MeetingPoker'
import TimelineEventPokerComplete from '../../database/types/TimelineEventPokerComplete'
import {getUserId, isSuperUser, isTeamMember} from '../../utils/authorization'
import getRedis from '../../utils/getRedis'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import EndSprintPokerPayload from '../types/EndSprintPokerPayload'
import sendMeetingEndToSegment from './helpers/endMeeting/sendMeetingEndToSegment'
import sendNewMeetingSummary from './helpers/endMeeting/sendNewMeetingSummary'
import {endSlackMeeting} from './helpers/notifySlack'
import removeEmptyTasks from './helpers/removeEmptyTasks'

export default {
  type: GraphQLNonNull(EndSprintPokerPayload),
  description: 'Finish a sprint poker meeting',
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
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
      .run()) as Meeting | null
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, facilitatorStageId, phases, teamId} = meeting

    // VALIDATION
    if (!isTeamMember(authToken, teamId) && !isSuperUser(authToken)) {
      return standardError(new Error('Not on team'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

    // RESOLUTION
    // remove hovering data from redis
    const estimatePhase = phases.find((phase) => phase.phaseType === 'ESTIMATE')!
    const {stages: estimateStages} = estimatePhase
    if (estimateStages.length > 0) {
      const redisKeys = estimateStages.map((stage) => `pokerHover:${stage.id}`)
      const redis = getRedis()
      // no need to await
      redis.del(...redisKeys)
    }
    const currentStageRes = findStageById(phases, facilitatorStageId)
    if (!currentStageRes) {
      return standardError(new Error('Cannot find facilitator stage'), {userId: viewerId})
    }
    const {stage} = currentStageRes
    const phase = getMeetingPhase(phases)
    stage.isComplete = true
    stage.endAt = now

    const completedMeeting = ((await r
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
      .run()) as unknown) as MeetingPoker
    if (!completedMeeting) {
      return standardError(new Error('Completed poker meeting does not exist'), {
        userId: viewerId
      })
    }
    const {templateId} = completedMeeting
    const [meetingMembers, team, teamMembers, removedTaskIds, template] = await Promise.all([
      dataLoader.get('meetingMembersByMeetingId').load(meetingId),
      dataLoader.get('teams').load(teamId),
      dataLoader.get('teamMembersByTeamId').load(teamId),
      removeEmptyTasks(meetingId),
      // technically, this template could have mutated while the meeting was going on. but in practice, probably not
      dataLoader.get('meetingTemplates').load(templateId)
    ])
    endSlackMeeting(meetingId, teamId, dataLoader).catch(console.log)
    sendMeetingEndToSegment(completedMeeting, meetingMembers as MeetingMember[], template)
    const isKill = phase.phaseType !== 'ESTIMATE'
    if (!isKill) {
      sendNewMeetingSummary(completedMeeting, context).catch(console.log)
    }
    const events = teamMembers.map(
      (teamMember) =>
        new TimelineEventPokerComplete({
          userId: teamMember.userId,
          teamId,
          orgId: team.orgId,
          meetingId
        })
    )
    await r
      .table('TimelineEvent')
      .insert(events)
      .run()

    const data = {
      meetingId,
      teamId,
      isKill,
      removedTaskIds
    }
    publish(SubscriptionChannel.TEAM, teamId, 'EndSprintPokerSuccess', data, subOptions)

    return data
  }
}
