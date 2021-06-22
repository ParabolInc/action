import config from './config'
import express from 'express'
import fs from 'fs'
import url from 'url'
import protoo from 'protoo-server'
import {types as mediasoupTypes, createWorker} from 'mediasoup'
import Room from './lib/Room'
import {AwaitQueue} from 'awaitqueue'
import getVerifiedAuthToken from 'parabol-server/utils/getVerifiedAuthToken'
import {isAuthenticated, isTeamMember} from 'parabol-server/utils/authorization'
import checkBlacklistJWT from 'parabol-server/utils/checkBlacklistJWT'
import LoggerFactory from 'parabol-client/utils/mediaRoom/Logger'
import {deStructureRoomId} from 'parabol-client/utils/mediaRoom/initMediaRoom'

let logger
;(async () => {
  logger = await LoggerFactory()
})()
const mediasoupWorkers = []
const rooms = new Map<string, Room>()
const queue = new AwaitQueue()

async function getOrCreateRoom(roomId: string) {
  if (!rooms.get(roomId)) {
    const worker = getMediaSoupWorker()
    const room = await Room.create(roomId, worker)
    rooms.set(roomId, room)
    room.on('close', () => rooms.delete(roomId))
  }
  return rooms.get(roomId)
}

export function getMediaSoupWorker() {
  return mediasoupWorkers[0] // hard coded for now
}

async function runMediasoupWorkers() {
  const {numWorkers} = config.mediasoup
  const {logLevel, logTags, rtcMinPort, rtcMaxPort} = config.mediasoup.workerSettings
  for (let i = 0; i < 1; i++) {
    // hard code to 1 for now
    const worker = await createWorker({
      logLevel: logLevel as mediasoupTypes.WorkerLogLevel,
      logTags: logTags as mediasoupTypes.WorkerLogTag[],
      rtcMinPort: Number(rtcMinPort),
      rtcMaxPort: Number(rtcMaxPort)
    })
    worker.on('died', () => {
      logger.info('mediasoup Worker died, exiting  in 2 seconds... [pid:%d]', worker.pid)
      setTimeout(() => process.exit(1), 2000)
    })
    mediasoupWorkers.push(worker)
    // setInterval(async () => {
    //   const usage = await worker.getResourceUsage()
    //   logger.info('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage)
    // }, 120000)
  }
}

async function runWebSocketServer() {
  const isProduction = process.env.NODE_ENV === 'production'
  const httpModule = isProduction ? await import('http') : await import('https')
  const options = isProduction
    ? {}
    : {
        cert: fs.readFileSync(config.https.tls.cert),
        key: fs.readFileSync(config.https.tls.key)
      }
  const server = httpModule.createServer(options, express() as any)

  await new Promise((resolve) => {
    server.listen(Number(config.http.listenPort), config.http.listenIp, resolve)
  })
  const websocketServer = new protoo.WebSocketServer(server, {
    maxReceivedFrameSize: 960000, // 960 KBytes.
    maxReceivedMessageSize: 960000,
    fragmentOutgoingMessages: true,
    fragmentationThreshold: 960000
  })
  console.log(`\n🎥🎥🎥 Media Server Ready: Port ${config.http.listenPort}  🎥🎥🎥`)
  // validate auth token
  websocketServer.on('connectionrequest', async (info, accept, reject) => {
    const requestUrl = url.parse(info.request.url, true)
    const {roomId, peerId, authToken: encodedAuthToken} = requestUrl.query
    const missingParams = [] as string[]
    if (!roomId) missingParams.push('roomId')
    if (!peerId) missingParams.push('peerId')
    if (!encodedAuthToken) missingParams.push('authToken')
    if (missingParams.length > 0) {
      reject(400, 'Connection request without required field(s):', missingParams)
      return
    }
    const decodedAuthToken = getVerifiedAuthToken(encodedAuthToken as string)
    if (!isAuthenticated(decodedAuthToken)) {
      reject(401, 'No authentication credentials')
      return
    }
    const {sub: userId, iat} = decodedAuthToken
    const isBlacklistedJWT = await checkBlacklistJWT(userId, iat)
    logger.debug('Is blacklisted:', isBlacklistedJWT)
    if (isBlacklistedJWT) {
      reject(401, 'Your authentication has expired')
      return
    }
    const [teamId] = deStructureRoomId(roomId as string)
    if (!isTeamMember(decodedAuthToken, teamId as string)) {
      reject(403, "Oops! You're not authorized to be here")
      return
    }

    /* queue to avoid race condition where we create same room twice */
    queue.push(async () => {
      const room = await getOrCreateRoom(roomId as string)
      logger.debug('Got room with room id:', room.roomId)
      const transport = accept()
      room.createPeer(peerId as string, transport)
    })
  })
}

async function main() {
  await runMediasoupWorkers()
  await runWebSocketServer()
}

if (process.env.ALLOW_VIDEO) main()
