import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveNewMeeting} from '../resolvers'
import Team from './Team'
import Task from './Task'
import StandardMutationError from './StandardMutationError'
import NewMeeting from './NewMeeting'
import {GQLContext} from '../graphql'
import {getUserId} from '../../utils/authorization'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import TimelineEvent from './TimelineEvent'

const EndNewMeetingPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'EndNewMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    isKill: {
      type: GraphQLBoolean,
      description: 'true if the meeting was killed (ended before reaching last stage)'
    },
    team: {
      type: Team,
      resolve: ({teamId}, _args, {dataLoader}) => {
        return teamId ? dataLoader.get('teams').load(teamId) : null
      }
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    removedSuggestedActionId: {
      type: GraphQLID,
      description: 'The ID of the suggestion to try a retro meeting, if tried'
    },
    removedTaskIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID))
    },
    timelineEvent: {
      type: TimelineEvent,
      description: 'The event that has just ended',
      resolve: async (source, _args, {dataLoader}) => {
        // resolve: async({timelineEventId}, _args, {dataLoader})
        const {meetingId, timelineEventId} = source
        const test = await dataLoader.get('timelineEvents').load(timelineEventId)
        // const meeting = await dataLoader.get('newMeetings').load(meetingId)
        return test
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
        const allUpdatedTasks = await dataLoader.get('tasks').loadMany(updatedTaskIds)
        return allUpdatedTasks.filter((task) => {
          return isTaskPrivate(task.tags) ? task.userId === viewerId : true
        })
      }
    }
  })
})

export default EndNewMeetingPayload
