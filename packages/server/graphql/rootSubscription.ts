import {GraphQLObjectType} from 'graphql'
import notificationSubscription from './subscriptions/notificationSubscription'
import organizationSubscription from './subscriptions/organizationSubscription'
import taskSubscription from './subscriptions/taskSubscription'
import teamSubscription from './subscriptions/teamSubscription'
import meetingSubscription from './subscriptions/meetingSubscription'
import {GQLContext} from './graphql'

export default new GraphQLObjectType<any, GQLContext>({
  name: 'Subscription',
  fields: () =>
    ({
      meetingSubscription,
      notificationSubscription,
      organizationSubscription,
      taskSubscription,
      teamSubscription
    } as any)
})
