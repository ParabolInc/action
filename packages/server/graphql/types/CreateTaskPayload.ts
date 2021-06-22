import {GraphQLObjectType} from 'graphql'
import {getUserId} from '../../utils/authorization'
import errorFilter from '../errorFilter'
import {GQLContext} from '../graphql'
import {resolveTask} from '../resolvers'
import NotifyTaskInvolves from './NotifyTaskInvolves'
import StandardMutationError from './StandardMutationError'
import Task from './Task'

const CreateTaskPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'CreateTaskPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    task: {
      type: Task,
      resolve: resolveTask
    },
    involvementNotification: {
      type: NotifyTaskInvolves,
      resolve: async ({notificationIds}, _args, {authToken, dataLoader}) => {
        if (!notificationIds) return null
        const notifications = (
          await dataLoader.get('notifications').loadMany(notificationIds)
        ).filter(errorFilter)
        const viewerId = getUserId(authToken)
        return notifications.find((notification) => notification.userId === viewerId)
      }
    }
  })
})

export default CreateTaskPayload
