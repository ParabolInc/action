import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import RemoveSlackAuthPayload from '../types/RemoveSlackAuthPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

export default {
  name: 'RemoveSlackAuth',
  type: new GraphQLNonNull(RemoveSlackAuthPayload),
  description: 'Disconnect a team member from Slack',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the teamId to disconnect from the token'
    }
  },
  resolve: async (_source, {teamId}, {authToken, socketId: mutatorId, dataLoader}) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)
    const now = new Date()

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const existingAuth = await r
      .table('SlackAuth')
      .getAll(viewerId, {index: 'userId'})
      .filter({teamId})
      .nth(0)
      .default(null)
      .run()

    if (!existingAuth) {
      return standardError(new Error('Auth not found'), {userId: viewerId})
    }

    const authId = existingAuth.id
    await r({
      auth: r
        .table('SlackAuth')
        .get(authId)
        .update({botAccessToken: null, isActive: false, updatedAt: now}),
      notifications: r
        .table('SlackNotification')
        .getAll(teamId, {index: 'teamId'})
        .filter({userId: viewerId})
        .delete()
    }).run()

    const data = {authId, teamId, userId: viewerId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveSlackAuthPayload', data, subOptions)
    return data
  }
}
