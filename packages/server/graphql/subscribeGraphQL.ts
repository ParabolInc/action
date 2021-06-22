/*
  This is the primary stateful GraphQL function, to be broken out into its own server when necessary
  It containis 2 pieces of state:
    * The WebSocket (or EventStream, if SSE) to the client
    * A list of subscriptions (response streams) kept in the connection context
  In the future, we could break apart the socket server from the subscription server:
    * The socket server listens to a single redis channel (socket:socketId) and is unaware of GraphQL
    * The GraphQL subscription server keeps a dictionary of subscriptions by socketId
 */

import {createSourceEventStream, ExecutionResult} from 'graphql'
import {decode} from 'jsonwebtoken'
import {TrebuchetCloseReason} from 'parabol-client/types/constEnums'
import AuthToken from '../database/types/AuthToken'
import handleDisconnect from '../socketHandlers/handleDisconnect'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import sendGQLMessage from '../socketHelpers/sendGQLMessage'
import relayUnsubscribeAll from '../utils/relayUnsubscribeAll'
import sendToSentry from '../utils/sendToSentry'
import SubscriptionIterator from '../utils/SubscriptionIterator'
import DocumentCache from './DocumentCache'
import ResponseStream from './ResponseStream'
import publicSchema from './rootSchema'

export interface SubscribeRequest {
  connectionContext: ConnectionContext
  variables?: {[key: string]: any}
  docId?: string
  query?: string
  opId: string
  hideErrors?: boolean
}

export interface PubSubPayload {
  rootValue: {
    [subscriptionName: string]: {
      type: string
      [key: string]: any
    }
  }
  operationId: string
  mutatorId: string
}

const documentCache = new DocumentCache()
const reliableSubscriptionPayloadBlackList = [
  'UpdateDragLocationPayload',
  'AuthTokenPayload',
  'InvalidateSessionsPayload'
]
const subscribeGraphQL = async (req: SubscribeRequest) => {
  const {connectionContext, variables, docId, query, opId, hideErrors} = req
  const {id: socketId, authToken} = connectionContext
  const document = docId ? await documentCache.fromID(docId) : documentCache.fromString(query!)
  if (!document) {
    if (!hideErrors) {
      sendToSentry(new Error(`DocumentID not found: ${docId}`))
    }
    return
  }
  const context = {socketId, authToken}
  const sourceStream = (await createSourceEventStream(
    publicSchema,
    document,
    {},
    context,
    variables
  )) as SubscriptionIterator<PubSubPayload>

  const {errors} = sourceStream as ExecutionResult
  if (errors) {
    if (!hideErrors) {
      sendToSentry(new Error(errors[0].message))
    }
    return
  }
  const responseStream = new ResponseStream(sourceStream, req)
  // hold onto responseStream so we can unsubscribe from other contexts
  connectionContext.subs[opId] = responseStream
  for await (const payload of responseStream) {
    const {data} = payload as ExecutionResult
    const notificationType = data?.notificationSubscription?.__typename
    if (notificationType === 'AuthTokenPayload') {
      // AuthTokenPayload is sent when a user is added/removed from a team and their JWT is soft invalidated
      const jwt = data?.notificationSubscription.id
      connectionContext.authToken = new AuthToken(decode(jwt) as any)
      // When a JWT is invalidated, so are the subscriptions.
      // Allow the other subscription payloads to complete, then resubscribe
      setTimeout(() => {
        relayUnsubscribeAll(connectionContext, {isResub: true})
      }, 1000)
    } else if (notificationType === 'InvalidateSessionsPayload') {
      // InvalidateSessionsPayload is sent when e.g. a password is reset and the JWT is hard invalidated
      handleDisconnect(connectionContext, {
        exitCode: 1011,
        reason: TrebuchetCloseReason.SESSION_INVALIDATED
      })
    }
    if (!data) {
      sendGQLMessage(connectionContext, 'data', false, payload, opId)
    } else {
      const subscriptionName = Object.keys(data)[0]
      const subscriptionType = data[subscriptionName].__typename
      const syn = !reliableSubscriptionPayloadBlackList.includes(subscriptionType)
      sendGQLMessage(connectionContext, 'data', syn, payload, opId)
    }
  }
  const resubIdx = connectionContext.availableResubs.indexOf(opId)
  if (resubIdx !== -1) {
    // reinitialize the subscription
    connectionContext.availableResubs.splice(resubIdx, 1)
    subscribeGraphQL({...req, hideErrors: true}).catch()
  } else {
    sendGQLMessage(connectionContext, 'complete', false, undefined, opId)
  }
}

export default subscribeGraphQL
