import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveNewMeeting} from '../resolvers'
import Team from './Team'
import {GQLContext} from '../graphql'
import TimelineEvent from './TimelineEvent'
import makeMutationPayload from './makeMutationPayload'
import RetrospectiveMeeting from './RetrospectiveMeeting'

export const EndRetrospectiveSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'EndRetrospectiveSuccess',
  fields: () => ({
    isKill: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the meeting was killed (ended before reaching last stage)'
    },
    team: {
      type: GraphQLNonNull(Team),
      resolve: ({teamId}, _args, {dataLoader}) => {
        return teamId ? dataLoader.get('teams').load(teamId) : null
      }
    },
    meeting: {
      type: GraphQLNonNull(RetrospectiveMeeting),
      resolve: resolveNewMeeting
    },
    removedSuggestedActionId: {
      type: GraphQLID,
      description: 'The ID of the suggestion to try a retro meeting, if tried'
    },
    removedTaskIds: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID)))
    },
    timelineEvent: {
      type: GraphQLNonNull(TimelineEvent),
      description: 'An event that is important to the viewer, e.g. an ended meeting',
      resolve: async ({timelineEventId}, _args, {dataLoader}) => {
        return await dataLoader.get('timelineEvents').load(timelineEventId)
      }
    }
  })
})

const EndRetrospectivePayload = makeMutationPayload(
  'EndRetrospectivePayload',
  EndRetrospectiveSuccess
)

export default EndRetrospectivePayload
