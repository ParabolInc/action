import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import SlackNotification from './SlackNotification'

const SlackIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'SlackIntegration',
  description: 'OAuth token for a team member',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    isActive: {
      description: 'true if the auth is updated & ready to use for all features, else false',
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({botAccessToken}) => !!botAccessToken
    },
    botUserId: {
      type: GraphQLID,
      description: 'the parabol bot user id'
    },
    botAccessToken: {
      type: GraphQLID,
      description: 'the parabol bot access token, used as primary communication',
      resolve: async ({botAccessToken, userId}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === userId ? botAccessToken : null
      }
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
    },
    defaultTeamChannelId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The default channel to assign to new team notifications'
    },
    slackTeamId: {
      type: GraphQLID,
      description: 'The id of the team in slack'
    },
    slackTeamName: {
      type: GraphQLString,
      description: 'The name of the team in slack'
    },
    slackUserId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId in slack'
    },
    slackUserName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the user in slack'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team that the token is linked to'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the token was updated at'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the user that integrated Slack'
    },
    notifications: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SlackNotification))),
      description: 'A list of events and the slack channels they get posted to',
      resolve: async ({userId, teamId}, _args, {dataLoader}) => {
        const slackNotifications = await dataLoader.get('slackNotificationsByTeamId').load(teamId)
        return slackNotifications.filter((notification) => notification.userId === userId)
      }
    }
  })
})

export default SlackIntegration
