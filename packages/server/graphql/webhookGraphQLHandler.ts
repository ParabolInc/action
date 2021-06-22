import crypto from 'crypto'
import ms from 'ms'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import parseBody from '../parseBody'
import {toEpochSeconds} from '../utils/epochTime'
import publishWebhookGQL from '../utils/publishWebhookGQL'
import uWSAsyncHandler from './uWSAsyncHandler'

const {SEGMENT_FN_KEY, SERVER_SECRET} = process.env

interface IntranetPayload {
  query: string
  variables: Record<string, unknown>
}

const TOKEN_LIFE = ms('5m')
const webhookGraphQLHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const [timestampStr, signature] = req
    .getHeader('authorization')
    .slice(7)
    .split('.')
  const timestamp = parseInt(timestampStr, 10)
  // check out
  if (!timestamp || !signature) {
    console.log('bad timestamp or sig', timestampStr, signature)
    res.writeStatus('401').end()
    return
  }

  // check content-type
  const contentType = req.getHeader('content-type')
  if (!contentType.startsWith('application/json')) {
    console.log('bad contentType')
    res.writeStatus('415').end()
    return
  }

  // verify timestamp
  const segmentSig = crypto
    .createHmac('sha256', SEGMENT_FN_KEY!)
    .update(
      crypto
        .createHmac('sha256', SERVER_SECRET!)
        .update(timestampStr)
        .digest('base64')
    )
    .digest('base64')

  if (segmentSig !== signature) {
    console.log('bad sig')
    res.writeStatus('401').end()
    return
  }

  // verify expiration
  const expiration = toEpochSeconds(new Date(Date.now() + TOKEN_LIFE))
  if (expiration < timestamp) {
    console.log('expired')
    res.writeStatus('401').end()
    return
  }

  // verify body
  const body = await parseBody({res})
  if (!body) {
    res.writeStatus('422').end()
    return
  }

  const {query, variables} = (body as any) as IntranetPayload

  const result = await publishWebhookGQL(query, variables)
  res.cork(() => {
    res.writeHeader('content-type', 'application/json').end(JSON.stringify(result))
  })
})

export default webhookGraphQLHandler
