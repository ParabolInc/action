import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import Team from './Team'
import Task from './Task'
import {GQLContext} from '../graphql'
import {getUserId} from '../../utils/authorization'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import TimelineEvent from './TimelineEvent'
import makeMutationPayload from './makeMutationPayload'
import ActionMeeting from './ActionMeeting'
import {resolveNewMeeting} from '../resolvers'
import errorFilter from '../errorFilter'

export const EndCheckInSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'EndCheckInSuccess',
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
      type: GraphQLNonNull(ActionMeeting),
      resolve: resolveNewMeeting
    },
    removedSuggestedActionId: {
      type: GraphQLID,
      description: 'The ID of the suggestion to try a check-in meeting, if tried'
    },
    removedTaskIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID))
    },
    timelineEvent: {
      type: GraphQLNonNull(TimelineEvent),
      description: 'An event that is important to the viewer, e.g. an ended meeting',
      resolve: async ({timelineEventId}, _args, {dataLoader}) => {
        return await dataLoader.get('timelineEvents').load(timelineEventId)
      }
    },
    updatedTaskIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID))
    },
    updatedTasks: {
      type: new GraphQLList(new GraphQLNonNull(Task)),
      description: 'Any tasks that were updated during the meeting',
      resolve: async ({updatedTaskIds}, _args, {authToken, dataLoader}) => {
        if (!updatedTaskIds) return []
        const viewerId = getUserId(authToken)
        const allUpdatedTasks = (await dataLoader.get('tasks').loadMany(updatedTaskIds)).filter(
          errorFilter
        )
        return allUpdatedTasks.filter((task) => {
          return isTaskPrivate(task.tags) ? task.userId === viewerId : true
        })
      }
    }
  })
})

const EndCheckInPayload = makeMutationPayload('EndCheckInPayload', EndCheckInSuccess)

export default EndCheckInPayload
