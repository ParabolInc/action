import {TrebuchetCloseReason} from 'parabol-client/types/constEnums'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import AuthToken from '../database/types/AuthToken'
import parseBody from '../parseBody'
import parseFormBody from '../parseFormBody'
import StatelessContext from '../socketHelpers/StatelessContext'
import sseClients from '../sseClients'
import {getUserId} from '../utils/authorization'
import checkBlacklistJWT from '../utils/checkBlacklistJWT'
import getReqAuth from '../utils/getReqAuth'
import sendToSentry from '../utils/sendToSentry'
import uwsGetIP from '../utils/uwsGetIP'
import handleGraphQLTrebuchetRequest from './handleGraphQLTrebuchetRequest'
import uWSAsyncHandler from './uWSAsyncHandler'

const SSE_PROBLEM_USERS = [] as string[]

const httpGraphQLBodyHandler = async (
  res: HttpResponse,
  body: any,
  authToken: AuthToken,
  connectionId: string | undefined | null,
  ip: string
) => {
  const connectionContext = connectionId
    ? sseClients.get(connectionId)
    : new StatelessContext(ip, authToken)
  if (!connectionContext) {
    const viewerId = getUserId(authToken)
    if (!SSE_PROBLEM_USERS.includes(viewerId)) {
      SSE_PROBLEM_USERS.push(viewerId)
      sendToSentry(new Error('SSE response not found'), {userId: viewerId})
    }
    res.end('SSE Response not found')
    return
  }
  if (connectionId && connectionContext.authToken.sub !== (authToken as AuthToken).sub) {
    const viewerId = getUserId(authToken)
    sendToSentry(new Error('Security: Spoofed SSE connectionId'), {userId: viewerId})
    // quietly fail for cheaters
    res.writeStatus('200').end()
  }
  if (body.type !== 'start' && body.type !== 'stop') {
    res.writeStatus('415').end()
    return
  }

  if (!connectionId) {
    const {iat, sub: viewerId} = authToken
    if (viewerId) {
      const isBlacklistedJWT = await checkBlacklistJWT(viewerId, iat)
      if (isBlacklistedJWT) {
        res.writeStatus('401').end(TrebuchetCloseReason.EXPIRED_SESSION)
        return
      }
    }
  }
  const response = await handleGraphQLTrebuchetRequest(body, connectionContext)
  res.cork(() => {
    if (response) {
      res.writeHeader('content-type', 'application/json').end(JSON.stringify(response))
    } else {
      res.writeStatus('200').end()
    }
  })
}

const contentTypeBodyParserMap = {
  'application/json': parseBody,
  'multipart/form-data': parseFormBody
}

const httpGraphQLHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const connectionId = req.getHeader('x-correlation-id')
  const authToken = getReqAuth(req)
  const ip = uwsGetIP(res, req)
  const contentTypeHeader = req.getHeader('content-type')
  const shortCt = Object.keys(contentTypeBodyParserMap).find((key) =>
    contentTypeHeader.startsWith(key)
  )
  if (!shortCt) {
    res.writeStatus('415').end()
    return
  }
  const parseFn = contentTypeBodyParserMap[shortCt]
  const body = await parseFn({res, contentType: contentTypeHeader})
  if (!body) {
    res.writeStatus('422').end()
    return
  }
  await httpGraphQLBodyHandler(res, body, authToken, connectionId, ip)
})

export default httpGraphQLHandler
