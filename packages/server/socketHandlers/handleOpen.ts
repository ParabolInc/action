import {WebSocket, WebSocketBehavior} from 'uWebSockets.js'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import keepAlive from '../socketHelpers/keepAlive'
import {sendEncodedMessage} from '../socketHelpers/sendEncodedMessage'
import handleConnect from './handleConnect'

const APP_VERSION = process.env.npm_package_version

const handleOpen: WebSocketBehavior['open'] = async (socket: WebSocket) => {
  const {authToken, ip} = socket
  const connectionContext = (socket.connectionContext = new ConnectionContext(
    socket,
    authToken,
    ip
  ))
  // messages will start coming in before handleConnect completes & sit in the readyQueue
  const nextAuthToken = await handleConnect(connectionContext)
  sendEncodedMessage(connectionContext, {version: APP_VERSION, authToken: nextAuthToken})
  keepAlive(connectionContext)
}

export default handleOpen
