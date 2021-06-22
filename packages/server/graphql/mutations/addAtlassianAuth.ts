import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import AtlassianAuth from '../../database/types/AtlassianAuth'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLMutation} from '../graphql'
import AddAtlassianAuthPayload from '../types/AddAtlassianAuthPayload'

export default {
  name: 'AddAtlassianAuth',
  type: new GraphQLNonNull(AddAtlassianAuthPayload),
  args: {
    code: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (_source, {code, teamId}, {authToken, socketId: mutatorId, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    // RESOLUTION
    const r = await getRethink()
    const now = new Date()

    const manager = await AtlassianServerManager.init(code)
    const sites = await manager.getAccessibleResources()
    if (!Array.isArray(sites)) {
      return standardError(new Error(sites.message), {userId: viewerId})
    }
    const cloudIds = sites.map((cloud) => cloud.id)
    const self = await manager.getMyself(cloudIds[0])
    if (!('accountId' in self)) {
      return standardError(new Error(self.message), {userId: viewerId})
    }
    const {accessToken, refreshToken} = manager

    let atlassianAuthId
    const existingAuth = await r
      .table('AtlassianAuth')
      .getAll(viewerId, {index: 'userId'})
      .filter({teamId})
      .nth(0)
      .default(null)
      .run()
    if (existingAuth) {
      atlassianAuthId = existingAuth.id
      await r
        .table('AtlassianAuth')
        .get(existingAuth.id)
        .update({
          isActive: true,
          accessToken,
          accountId: self.accountId,
          cloudIds,
          refreshToken,
          updatedAt: now
        })
        .run()
    } else {
      const atlassianAuth = new AtlassianAuth({
        accessToken,
        accountId: self.accountId,
        cloudIds,
        refreshToken: refreshToken!,
        teamId,
        userId: viewerId
      })
      atlassianAuthId = atlassianAuth.id
      await r
        .table('AtlassianAuth')
        .insert(atlassianAuth)
        .run()
    }

    segmentIo.track({
      userId: viewerId,
      event: 'Added Integration',
      properties: {
        teamId,
        service: 'Atlassian'
      }
    })
    const data = {atlassianAuthId, teamId, userId: viewerId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddAtlassianAuthPayload', data, subOptions)
    return data
  }
} as GQLMutation
