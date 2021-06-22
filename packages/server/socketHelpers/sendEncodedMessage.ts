import {HttpResponse, WebSocket} from 'uWebSockets.js'
import sendSSEMessage from '../sse/sendSSEMessage'
import ConnectionContext from './ConnectionContext'
import isHttpResponse from './isHttpResponse'

const ESTIMATED_MTU = 1400

const sendAndPushToReliableQueue = (context: ConnectionContext, mid: number, message: string) => {
  const {socket, reliableQueue} = context
  sendEncodedMessageBasedOnSocket(socket, message)
  context.clearEntryForReliableQueue(mid)
  reliableQueue[mid] = message
}

const sendEncodedMessageBasedOnSocket = (socket: WebSocket | HttpResponse, message: string) => {
  isHttpResponse(socket)
    ? sendSSEMessage(socket as HttpResponse, message)
    : socket.send(message, false, message.length > ESTIMATED_MTU)
}

const sendEncodedMessage = (context: ConnectionContext, object: any, syn = false) => {
  const {socket} = context
  if (socket.done) return

  if (syn) {
    const mid = context.getMid()
    const message = JSON.stringify([object, mid])
    sendAndPushToReliableQueue(context, mid, message)
  } else {
    const message = JSON.stringify(object)
    sendEncodedMessageBasedOnSocket(socket, message)
  }
}

export {sendEncodedMessage, sendAndPushToReliableQueue}
