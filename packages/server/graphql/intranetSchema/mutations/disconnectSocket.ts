import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import db from '../../../db'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import segmentIo from '../../../utils/segmentIo'
import {GQLContext} from '../../graphql'
import DisconnectSocketPayload from '../../types/DisconnectSocketPayload'
import getRedis from '../../../utils/getRedis'
import {UserPresence} from './connectSocket'
import getListeningUserIds, {RedisCommand} from '../../../utils/getListeningUserIds'
export default {
  name: 'DisconnectSocket',
  description: 'a server-side mutation called when a client disconnects',
  type: DisconnectSocketPayload,
  resolve: async (_source, _args, {authToken, socketId}: GQLContext) => {
    // Note: no server secret means a client could call this themselves & appear disconnected when they aren't!
    const redis = getRedis()

    // AUTH
    if (!socketId) return undefined
    const userId = getUserId(authToken)

    // RESOLUTION
    const user = await db.read('User', userId)
    const {tms} = user
    const userPresence = await redis.lrange(`presence:${userId}`, 0, -1)
    const parsedUserPresence = userPresence.map((socket) => JSON.parse(socket)) as UserPresence[]
    const disconnectingSocket = parsedUserPresence.find((socket) => socket.socketId === socketId)
    if (!disconnectingSocket) {
      throw new Error('Called disconnect without a valid socket')
    }
    await redis.lrem(`presence:${userId}`, 0, JSON.stringify(disconnectingSocket))

    // If this is the last socket, tell everyone they're offline
    if (userPresence.length === 1) {
      const listeningUserIds = await getListeningUserIds(RedisCommand.REMOVE, tms, userId)
      const subOptions = {mutatorId: socketId}
      const data = {user}
      listeningUserIds.forEach((onlineUserId) => {
        publish(
          SubscriptionChannel.NOTIFICATION,
          onlineUserId,
          'DisconnectSocketPayload',
          data,
          subOptions
        )
      })
    }
    segmentIo.track({
      userId,
      event: 'Disconnect WebSocket',
      properties: {
        socketCount: userPresence.length,
        socketId,
        tms
      }
    })
    return {user}
  }
}
