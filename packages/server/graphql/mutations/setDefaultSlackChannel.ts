import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import SetDefaultSlackChannelPayload from '../types/SetDefaultSlackChannelPayload'
import {GQLContext} from '../graphql'
import standardError from '../../utils/standardError'
import SlackServerManager from '../../utils/SlackServerManager'

const setDefaultSlackChannel = {
  type: GraphQLNonNull(SetDefaultSlackChannelPayload),
  description: 'Update the default Slack channel where notifications are sent',
  args: {
    slackChannelId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (_source, {slackChannelId, teamId}, {authToken, dataLoader}: GQLContext) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)

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
    const {id: slackAuthId, botAccessToken, defaultTeamChannelId, slackUserId} = slackAuth
    const manager = new SlackServerManager(botAccessToken)
    const channelInfo = await manager.getConversationInfo(slackChannelId)

    // should either be a public / private channel or the slackUserId if messaging from @Parabol
    if (slackChannelId !== slackUserId) {
      if (!channelInfo.ok) {
        return standardError(new Error(channelInfo.error), {userId: viewerId})
      }
      const {channel} = channelInfo
      const {id: channelId, is_member: isMember, is_archived: isArchived} = channel
      if (isArchived) {
        return standardError(new Error('Slack channel archived'), {userId: viewerId})
      }
      if (!isMember) {
        const joinConvoRes = await manager.joinConversation(channelId)
        if (!joinConvoRes.ok) {
          return standardError(new Error('Unable to join slack channel'), {userId: viewerId})
        }
      }
    }

    // RESOLUTION
    if (slackChannelId !== defaultTeamChannelId) {
      await r
        .table('SlackAuth')
        .get(slackAuthId)
        .update({defaultTeamChannelId: slackChannelId})
        .run()
    }
    const data = {slackChannelId, teamId, userId: viewerId}
    return data
  }
}

export default setDefaultSlackChannel
