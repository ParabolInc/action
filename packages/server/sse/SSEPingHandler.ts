import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import AuthToken from '../database/types/AuthToken'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import sseClients from '../sseClients'
import getReqAuth from '../utils/getReqAuth'
import handleReliableMessage from '../utils/handleReliableMessage'

const SSEPingHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const connectionId = req.getHeader('x-correlation-id')
  const connectionContext = sseClients.get(connectionId)
  if (connectionContext) {
    const authToken = getReqAuth(req)
    if ((authToken as AuthToken).sub === connectionContext.authToken.sub) {
      connectionContext.isAlive = true
    }
  }

  const parser = (buffer: Buffer) => buffer
  const messageBuffer = await parseBody({res, parser})
  if (messageBuffer?.length == 4) {
    handleReliableMessage(messageBuffer, connectionContext)
  }

  res.end()
})

export default SSEPingHandler
