import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import PokerMeeting from './PokerMeeting'
import Team from './Team'

export const EndSprintPokerSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'EndSprintPokerSuccess',
  fields: () => ({
    isKill: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the meeting was killed (ended before reaching last stage)'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    meeting: {
      type: GraphQLNonNull(PokerMeeting),
      resolve: ({meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    removedTaskIds: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID)))
    },
    team: {
      type: GraphQLNonNull(Team),
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID)
    }
  })
})

const EndSprintPokerPayload = makeMutationPayload('EndSprintPokerPayload', EndSprintPokerSuccess)

export default EndSprintPokerPayload
