import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import Team from './Team'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import ActionMeeting from './ActionMeeting'

export const StartCheckInSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'StartCheckInSuccess',
  fields: () => ({
    meeting: {
      type: GraphQLNonNull(ActionMeeting),
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

const StartCheckInPayload = makeMutationPayload('StartCheckInPayload', StartCheckInSuccess)

export default StartCheckInPayload
