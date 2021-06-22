import {WebSocketBehavior} from 'uWebSockets.js'
import {TrebuchetCloseReason} from '../../client/types/constEnums'
import {isAuthenticated} from '../utils/authorization'
import checkBlacklistJWT from '../utils/checkBlacklistJWT'
import getQueryToken from '../utils/getQueryToken'
import sendToSentry from '../utils/sendToSentry'
import uwsGetIP from '../utils/uwsGetIP'

const handleUpgrade: WebSocketBehavior['upgrade'] = async (res, req, context) => {
  const aborted = {done: false}
  const protocol = req.getHeader('sec-websocket-protocol')
  if (protocol !== 'trebuchet-ws') {
    sendToSentry(new Error(`WebSocket error: invalid protocol: ${protocol}`))
    // WS Error 1002 is roughly HTTP 412 Precondition Failed because we can't support the req header
    res.writeStatus('412').end()
    return
  }
  const authToken = getQueryToken(req)
  if (!isAuthenticated(authToken)) {
    res.writeStatus('401').end()
    return
  }
  res.onAborted(() => {
    aborted.done = true
  })

  const key = req.getHeader('sec-websocket-key')
  const extensions = req.getHeader('sec-websocket-extensions')
  const ip = uwsGetIP(res, req)
  const {sub: userId, iat} = authToken
  // ALL async calls must come after the message listener, or we'll skip out on messages (e.g. resub after server restart)
  const isBlacklistedJWT = await checkBlacklistJWT(userId, iat)
  if (aborted.done) return
  if (isBlacklistedJWT) {
    res.writeStatus('401').end(TrebuchetCloseReason.EXPIRED_SESSION)
    return
  }

  res.upgrade({ip, authToken}, key, protocol, extensions, context)
}

export default handleUpgrade
