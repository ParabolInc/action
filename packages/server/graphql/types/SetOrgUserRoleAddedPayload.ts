import {GraphQLList, GraphQLObjectType} from 'graphql'
import {getUserId} from '../../utils/authorization'
import errorFilter from '../errorFilter'
import {GQLContext} from '../graphql'
import Notification from './Notification'
import SetOrgUserRolePayload, {setOrgUserRoleFields} from './SetOrgUserRolePayload'

const SetOrgUserRoleAddedPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'SetOrgUserRoleAddedPayload',
  interfaces: () => [SetOrgUserRolePayload],
  fields: () => ({
    ...setOrgUserRoleFields,
    notificationsAdded: {
      type: new GraphQLList(Notification),
      description: 'If promoted, notify them and give them all other admin notifications',
      resolve: async ({notificationIdsAdded}, _args, {authToken, dataLoader}) => {
        if (!notificationIdsAdded) return []
        const viewerId = getUserId(authToken)
        const notifications = (
          await dataLoader.get('notifications').loadMany(notificationIdsAdded)
        ).filter(errorFilter)
        return notifications.filter((notification) => notification.userId === viewerId)
      }
    }
  })
})

export default SetOrgUserRoleAddedPayload
