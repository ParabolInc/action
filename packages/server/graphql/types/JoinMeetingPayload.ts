import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import NewMeeting from './NewMeeting'

export const JoinMeetingSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'JoinMeetingSuccess',
  fields: () => ({
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    meeting: {
      type: GraphQLNonNull(NewMeeting),
      description: 'The meeting with the updated stages, if any',
      resolve: ({meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

const JoinMeetingPayload = makeMutationPayload('JoinMeetingPayload', JoinMeetingSuccess)

export default JoinMeetingPayload
