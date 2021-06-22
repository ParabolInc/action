import {ExecutionResult} from 'graphql'
import {getUserId} from '../utils/authorization'
import getGraphQLExecutor from '../utils/getGraphQLExecutor'
import sendToSentry from '../utils/sendToSentry'
import SubscriptionIterator from '../utils/SubscriptionIterator'
import {SubscribeRequest} from './subscribeGraphQL'

export default class ResponseStream implements AsyncIterableIterator<ExecutionResult> {
  private sourceStream: SubscriptionIterator
  private req: SubscribeRequest

  constructor(sourceStream: SubscriptionIterator, req: SubscribeRequest) {
    this.sourceStream = sourceStream
    this.req = req
  }

  [Symbol.asyncIterator]() {
    return this
  }
  async next() {
    const sourceIter = await this.sourceStream.next()
    if (sourceIter.done) return sourceIter
    const {mutatorId, operationId: dataLoaderId, rootValue} = sourceIter.value
    const {connectionContext, query, variables, docId} = this.req
    const {id: socketId, authToken, ip} = connectionContext
    if (mutatorId === socketId) return this.next()
    try {
      const result = await getGraphQLExecutor().publish({
        docId,
        authToken,
        dataLoaderId,
        ip,
        query,
        variables,
        rootValue,
        socketId
      })
      if (result.errors) {
        sendToSentry(new Error(result.errors[0].message))
        return this.next()
      }
      return {done: false, value: result}
    } catch (e) {
      sendToSentry(e, {userId: getUserId(authToken)})
      return this.next()
    }
  }
  return() {
    this.sourceStream.return()
    return Promise.resolve({done: true as const, value: undefined})
  }
  throw(error) {
    this.sourceStream.throw(error)
    return Promise.resolve({done: true, value: error})
  }
}
