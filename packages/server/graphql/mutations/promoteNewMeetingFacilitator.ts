import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import publish from '../../utils/publish'
import {getUserId, isTeamMember} from '../../utils/authorization'
import PromoteNewMeetingFacilitatorPayload from '../types/PromoteNewMeetingFacilitatorPayload'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

export default {
  type: PromoteNewMeetingFacilitatorPayload,
  description: 'Change a facilitator while the meeting is in progress',
  args: {
    facilitatorUserId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'userId of the new facilitator for this meeting'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source,
    {facilitatorUserId, meetingId},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
      .run()
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {facilitatorUserId: oldFacilitatorUserId, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const newFacilitator = await dataLoader.get('users').load(facilitatorUserId)
    if (!newFacilitator.tms.includes(teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        facilitatorUserId,
        updatedAt: now
      })
      .run()

    const data = {meetingId, oldFacilitatorUserId}
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'PromoteNewMeetingFacilitatorPayload',
      data,
      subOptions
    )
    return data
  }
}
