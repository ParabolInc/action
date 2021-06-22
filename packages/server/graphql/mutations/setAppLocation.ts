import {GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import rateLimit from '../rateLimit'
import SetAppLocationPayload from '../types/SetAppLocationPayload'
import getRedis from '../../utils/getRedis'
import {UserPresence} from '../intranetSchema/mutations/connectSocket'
import sendToSentry from '../../utils/sendToSentry'

export default {
  type: new GraphQLNonNull(SetAppLocationPayload),
  description: `Share where in the app the viewer is`,
  args: {
    location: {
      type: GraphQLString,
      description: 'The location the viewer is currently at'
    }
  },
  // rate limited because a notificationId subverts the expiration of the token & we don't want any brute forces for expired tokens
  resolve: rateLimit({
    perMinute: 50,
    perHour: 100
  })(async (_source, {location}, {authToken, dataLoader, socketId: mutatorId}) => {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const redis = getRedis()
    if (!mutatorId) {
      sendToSentry(new Error('No mutator id in setAppLocation.ts'))
    }

    // AUTH
    const viewerId = getUserId(authToken)
    const viewer = viewerId ? await dataLoader.get('users').load(viewerId) : null
    if (!viewer) {
      return {error: {message: 'Not a user'}}
    }
    const userPresence = await redis.lrange(`presence:${viewerId}`, 0, -1)
    const connectedSocket = userPresence.find((socket) => JSON.parse(socket).socketId === mutatorId)
    if (!connectedSocket) {
      return {error: {message: "Socket doesn't exist"}}
    }
    // RESOLUTION
    const parsedConnectedSocket = JSON.parse(connectedSocket) as UserPresence
    const {lastSeenAtURL} = parsedConnectedSocket
    const data = {userId: viewerId}
    if (lastSeenAtURL !== location) {
      parsedConnectedSocket.lastSeenAtURL = location
      await redis
        .multi()
        .lrem(`presence:${viewerId}`, 0, connectedSocket)
        .rpush(`presence:${viewerId}`, JSON.stringify(parsedConnectedSocket))
        .exec()
      const meetingId = lastSeenAtURL?.includes('/meet/')
        ? lastSeenAtURL.slice(6)
        : location?.includes('/meet/')
        ? location.slice(6)
        : null
      if (meetingId) {
        publish(SubscriptionChannel.MEETING, meetingId, 'SetAppLocationSuccess', data, subOptions)
      }
    }
    return data
  })
}
