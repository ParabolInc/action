import {GraphQLNonNull} from 'graphql'
import {InvoiceItemType, SubscriptionChannel} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../../billing/helpers/adjustUserCount'
import getRethink from '../../../database/rethinkDriver'
import db from '../../../db'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import segmentIo from '../../../utils/segmentIo'
import {GQLContext} from '../../graphql'
import User from '../../types/User'
import getRedis from '../../../utils/getRedis'
import getListeningUserIds, {RedisCommand} from '../../../utils/getListeningUserIds'
import updateUser from '../../../postgres/queries/updateUser'

export interface UserPresence {
  lastSeenAtURL: string | null
  serverId: string
  socketId: string
}
const {SERVER_ID} = process.env
export default {
  name: 'ConnectSocket',
  description: 'a server-side mutation called when a client connects',
  type: GraphQLNonNull(User),
  resolve: async (_source, _args, {authToken, dataLoader, socketId}: GQLContext) => {
    const r = await getRethink()
    const redis = getRedis()
    const now = new Date()

    // AUTH
    if (!socketId) {
      throw new Error('Called connect without a valid socket')
    }
    const userId = getUserId(authToken)

    // RESOLUTION
    const user = await db.read('User', userId)
    const {inactive, lastSeenAt, tms} = user

    // no need to wait for this, it's just for billing
    if (inactive) {
      const orgIds = await r
        .table('OrganizationUser')
        .getAll(userId, {index: 'userId'})
        .filter({removedAt: null, inactive: true})('orgId')
        .run()
      adjustUserCount(userId, orgIds, InvoiceItemType.UNPAUSE_USER).catch(console.log)
      // TODO: re-identify
    }
    const datesAreOnSameDay = now.toDateString() === lastSeenAt?.toDateString()
    if (!datesAreOnSameDay) {
      await Promise.all([
        updateUser(
          {
            inactive: false,
            lastSeenAt: now
          },
          userId
        ),
        db.write('User', userId, {inactive: false, lastSeenAt: now})
      ])
    }
    const socketCount = await redis.rpush(
      `presence:${userId}`,
      JSON.stringify({lastSeenAtURL: null, serverId: SERVER_ID, socketId} as UserPresence)
    )

    // If this is the first socket, tell everyone they're online
    if (socketCount === 1) {
      const listeningUserIds = await getListeningUserIds(RedisCommand.ADD, tms, userId)
      const operationId = dataLoader.share()
      const subOptions = {mutatorId: socketId, operationId}
      listeningUserIds.forEach((onlineUserId) => {
        publish(SubscriptionChannel.NOTIFICATION, onlineUserId, 'User', user, subOptions)
      })
    }

    segmentIo.track({
      userId,
      event: 'Connect WebSocket',
      properties: {
        socketCount,
        socketId,
        tms
      }
    })
    return user
  }
}
