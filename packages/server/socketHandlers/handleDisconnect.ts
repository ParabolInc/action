import closeTransport from '../socketHelpers/closeTransport'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import sseClients from '../sseClients'
import publishInternalGQL from '../utils/publishInternalGQL'
import relayUnsubscribeAll from '../utils/relayUnsubscribeAll'
import closeWRTC from '../wrtc/signalServer/closeWRTC'

interface Options {
  exitCode?: number
  reason?: string
}
const query = `
mutation DisconnectSocket {
  disconnectSocket {
    user {
      id
    }
  }
}`

const handleDisconnect = (connectionContext: ConnectionContext, options: Options = {}) => {
  const {exitCode = 1000, reason} = options
  const {authToken, ip, cancelKeepAlive, id: socketId, socket, isDisconnecting} = connectionContext
  if (isDisconnecting) return
  connectionContext.isDisconnecting = true
  // check if isClosing & if isClosing bail
  clearInterval(cancelKeepAlive!)
  relayUnsubscribeAll(connectionContext)
  closeWRTC(socket as any)
  publishInternalGQL({authToken, ip, query, socketId})
  if (connectionContext.id.startsWith('sse')) {
    sseClients.delete(connectionContext.id)
  }
  closeTransport(socket, exitCode, reason)
}

export default handleDisconnect
