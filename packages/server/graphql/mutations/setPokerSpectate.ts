import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import SetPokerSpectatePayload from '../types/SetPokerSpectatePayload'

const setPokerSpectate = {
  type: GraphQLNonNull(SetPokerSpectatePayload),
  description: `Set whether the user is spectating poker meeting`,
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    isSpectating: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the viewer is spectating poker and does not want to vote. else false'
    }
  },
  resolve: async (
    _source,
    {meetingId, isSpectating},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)

    if (!meetingMember) {
      return {error: {message: 'Not in meeting'}}
    }
    // RESOLUTION
    const {teamId} = meetingMember
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    await r({
      meetingMember: r
        .table('MeetingMember')
        .get(meetingMemberId)
        .update({isSpectating}),
      teamMember: r
        .table('TeamMember')
        .get(teamMemberId)
        .update({isSpectatingPoker: isSpectating, updatedAt: now})
    }).run()
    meetingMember.isSpectating = isSpectating
    const data = {meetingId, userId: viewerId}
    publish(SubscriptionChannel.MEETING, meetingId, 'SetPokerSpectateSuccess', data, subOptions)
    return data
  }
}

export default setPokerSpectate
