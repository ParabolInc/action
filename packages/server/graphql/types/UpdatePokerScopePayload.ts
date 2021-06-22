import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import PokerMeeting from './PokerMeeting'

export const UpdatePokerScopeSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdatePokerScopeSuccess',
  fields: () => ({
    meeting: {
      type: GraphQLNonNull(PokerMeeting),
      description: 'The meeting with the updated estimate phases',
      resolve: ({meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

const UpdatePokerScopePayload = makeMutationPayload(
  'UpdatePokerScopePayload',
  UpdatePokerScopeSuccess
)

export default UpdatePokerScopePayload
