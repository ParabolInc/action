import {GraphQLInt, GraphQLNonNull, GraphQLList, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import MeetingMember, {meetingMemberFields} from './MeetingMember'
import Task from './Task'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'

const RetrospectiveMeetingMember = new GraphQLObjectType<any, GQLContext>({
  name: 'RetrospectiveMeetingMember',
  interfaces: () => [MeetingMember],
  description: 'All the meeting specifics for a user in a retro meeting',
  fields: () => ({
    ...meetingMemberFields(),
    tasks: {
      type: new GraphQLNonNull(GraphQLList(GraphQLNonNull(Task))),
      description: 'The tasks assigned to members during the meeting',
      resolve: async ({meetingId, userId}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {teamId} = meeting
        const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        return teamTasks.filter((task) => {
          if (task.meetingId !== meetingId) return false
          if (task.userId !== userId) return false
          if (isTaskPrivate(task.tags)) return false
          return true
        })
      }
    },
    votesRemaining: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  })
})

export default RetrospectiveMeetingMember
