import {sendAndPushToReliableQueue} from '../socketHelpers/sendEncodedMessage'
import handleDisconnect from '../socketHandlers/handleDisconnect'
import ConnectionContext from '../socketHelpers/ConnectionContext'

const ACK = 0
const REQ = 1
const MASK = 1
const isAck = (robustId: number) => (robustId & MASK) === ACK
const isReq = (robustId: number) => (robustId & MASK) === REQ

const handleReliableMessage = (messageBuffer: Buffer, connectionContext: ConnectionContext) => {
  // reliable message ACK or REQ
  const robustId = messageBuffer.readUInt32LE()
  const mid = robustId >> 1
  if (isAck(robustId)) {
    connectionContext.clearEntryForReliableQueue(mid)
    return
  }
  if (isReq(robustId)) {
    const message = connectionContext.reliableQueue[mid]
    if (message) {
      sendAndPushToReliableQueue(connectionContext, mid, message)
    } else {
      handleDisconnect(connectionContext)
    }
    return
  }
}

export default handleReliableMessage
