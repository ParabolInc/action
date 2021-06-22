import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import Team from './Team'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import RetrospectiveMeeting from './RetrospectiveMeeting'

export const StartRetrospectiveSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'StartRetrospectiveSuccess',
  fields: () => ({
    meeting: {
      type: GraphQLNonNull(RetrospectiveMeeting),
      resolve: ({meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    team: {
      type: GraphQLNonNull(Team),
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    }
  })
})

const StartRetrospectivePayload = makeMutationPayload(
  'StartRetrospectivePayload',
  StartRetrospectiveSuccess
)

export default StartRetrospectivePayload
