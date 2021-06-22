import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import SetSlackNotificationPayload from '../types/SetSlackNotificationPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getRethink from '../../database/rethinkDriver'
import standardError from '../../utils/standardError'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import SlackNotification, {
  SlackNotificationEventEnum as TSlackNotificationEventEnum
} from '../../database/types/SlackNotification'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import SlackNotificationEventEnum from '../types/SlackNotificationEventEnum'

type SetSlackNotificationMutationVariables = {
  slackNotificationEvents: Array<TSlackNotificationEventEnum>
  slackChannelId?: string | null
  teamId: string
}
export default {
  name: 'SetSlackNotification',
  type: new GraphQLNonNull(SetSlackNotificationPayload),
  args: {
    slackChannelId: {
      type: GraphQLID
    },
    slackNotificationEvents: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SlackNotificationEventEnum)))
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {slackChannelId, slackNotificationEvents, teamId}: SetSlackNotificationMutationVariables,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const r = await getRethink()

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    // VALIDATION
    const slackAuths = await dataLoader.get('slackAuthByUserId').load(viewerId)
    const slackAuth = slackAuths.find((auth) => auth.teamId === teamId)

    if (!slackAuth) {
      return standardError(new Error('Slack authentication not found'), {userId: viewerId})
    }

    // RESOLUTION
    const existingNotifications = await r
      .table('SlackNotification')
      .getAll(viewerId, {index: 'userId'})
      .filter({teamId})
      .filter((row) => r(slackNotificationEvents).contains(row('event')))
      .run()

    const notifications = slackNotificationEvents.map((event) => {
      const existingNotification = existingNotifications.find(
        (notification) => notification.event === event
      )
      return new SlackNotification({
        event,
        channelId: slackChannelId,
        teamId,
        userId: viewerId,
        id: (existingNotification && existingNotification.id) || undefined
      })
    })
    await r
      .table('SlackNotification')
      .insert(notifications, {conflict: 'replace'})
      .run()
    const slackNotificationIds = notifications.map(({id}) => id)
    const data = {userId: viewerId, slackNotificationIds}
    publish(SubscriptionChannel.TEAM, teamId, 'SetSlackNotificationPayload', data, subOptions)
    return data
  }
}
