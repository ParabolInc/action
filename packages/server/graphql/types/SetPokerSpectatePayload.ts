import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import PokerMeetingMember from './PokerMeetingMember'

export const SetPokerSpectateSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'SetPokerSpectateSuccess',
  fields: () => ({
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    userId: {
      type: GraphQLNonNull(GraphQLID)
    },
    meetingMember: {
      type: GraphQLNonNull(PokerMeetingMember),
      description: 'The meeting member with the updated isSpectating value',
      resolve: async ({userId, meetingId}, _args, {dataLoader}) => {
        const meetingMemberId = toTeamMemberId(meetingId, userId)
        const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
        return meetingMember
      }
    }
  })
})

const SetPokerSpectatePayload = makeMutationPayload(
  'SetPokerSpectatePayload',
  SetPokerSpectateSuccess
)

export default SetPokerSpectatePayload
