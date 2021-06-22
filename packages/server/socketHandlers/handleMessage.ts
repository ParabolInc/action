import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import {WebSocket} from 'uWebSockets.js'
import handleGraphQLTrebuchetRequest from '../graphql/handleGraphQLTrebuchetRequest'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import keepAlive from '../socketHelpers/keepAlive'
import sendGQLMessage from '../socketHelpers/sendGQLMessage'
import sendToSentry from '../utils/sendToSentry'
import handleSignal from '../wrtc/signalServer/handleSignal'
import validateInit from '../wrtc/signalServer/validateInit'
import handleReliableMessage from '../utils/handleReliableMessage'

interface WRTCMessage {
  type: 'WRTC_SIGNAL'
  signal: any
}

const handleParsedMessage = async (
  parsedMessage: OutgoingMessage | WRTCMessage,
  connectionContext: ConnectionContext
) => {
  const {socket, authToken} = connectionContext
  const parsedMessages = Array.isArray(parsedMessage) ? parsedMessage : [parsedMessage]
  parsedMessages.forEach(async (msg) => {
    if (msg.type === 'WRTC_SIGNAL') {
      if (validateInit(socket as any, msg.signal, authToken)) {
        handleSignal(socket as any, msg.signal)
      }
      return
    }
    const response = await handleGraphQLTrebuchetRequest(msg, connectionContext)
    if (response) {
      const {type, id: opId, payload} = response
      sendGQLMessage(connectionContext, type, false, payload, opId)
    }
  })
}

const PONG = 65
const isPong = (messageBuffer: Buffer) => messageBuffer.length === 1 && messageBuffer[0] === PONG

const handleMessage = (
  websocket: WebSocket | {connectionContext: ConnectionContext},
  message: ArrayBuffer
) => {
  const {connectionContext} = websocket
  const messageBuffer = Buffer.from(message)
  if (isPong(messageBuffer)) {
    keepAlive(connectionContext)
    return
  }
  if (messageBuffer.length == 4) {
    handleReliableMessage(messageBuffer, connectionContext)
    return
  }
  let parsedMessage
  try {
    parsedMessage = JSON.parse(Buffer.from(message).toString())
  } catch (e) {
    // ignore the message
    return
  }

  if (connectionContext.isReady) {
    handleParsedMessage(parsedMessage, connectionContext)
  } else {
    connectionContext.readyQueue.push(() => {
      handleParsedMessage(parsedMessage, connectionContext)
    })
  }
}

const safeHandleMessage = (websocket: WebSocket, message: ArrayBuffer) => {
  try {
    handleMessage(websocket, message)
  } catch (e) {
    sendToSentry(e)
  }
}
export default safeHandleMessage
