import {
  ClientMessageTypes,
  OutgoingMessage,
  ServerMessageTypes
} from '@mattkrick/graphql-trebuchet-client'
import wsGraphQLHandler from '../socketHandlers/wsGraphQLHandler'
import handleSubscribe from '../socketHandlers/handleSubscribe'
import relayUnsubscribe from '../utils/relayUnsubscribe'
import ConnectionContext from '../socketHelpers/ConnectionContext'

interface Options {
  getQueryString?: (hash: string) => string | Promise<string>
  isQueryAllowed?(query: string, connectionContext: ConnectionContext): boolean
}

const {GQL_START, GQL_STOP} = ServerMessageTypes
const {GQL_DATA, GQL_ERROR} = ClientMessageTypes

const IGNORE_MUTATIONS = ['updateDragLocation']

const handleGraphQLTrebuchetRequest = async (
  data: OutgoingMessage,
  connectionContext: ConnectionContext,
  options: Options = {}
) => {
  const opId = data.id!
  switch (data.type) {
    case GQL_START:
      const {payload} = data
      if (!payload) {
        throw new Error('No payload provided')
      }
      const {variables, documentId} = payload

      const {getQueryString, isQueryAllowed} = options
      let query: string | null | undefined = payload.query
      // const isQueryAllowed = options.isQueryAllowed || trueOp
      if (query) {
        if (getQueryString) {
          if (isQueryAllowed && !isQueryAllowed(query, connectionContext)) {
            throw new Error('Custom queries are not allowed')
          }
        }
      } else {
        query = getQueryString ? await getQueryString(documentId!) : null
        if (!query) {
          throw new Error('Invalid document ID')
        }
      }

      const params = {query, variables}
      if (query.startsWith('subscription')) {
        handleSubscribe(connectionContext, {id: opId, payload: params}).catch()
        return
      } else {
        const result = await wsGraphQLHandler(connectionContext, params)
        if (result.data && IGNORE_MUTATIONS.includes(Object.keys(result.data)[0])) return
        const messageType = result.data ? GQL_DATA : GQL_ERROR
        return {type: messageType, id: opId, payload: result}
      }
    case GQL_STOP:
      relayUnsubscribe(connectionContext.subs, opId)
      return
    default:
      throw new Error('No type provided to GraphQL Trebuchet Server')
  }
}

export default handleGraphQLTrebuchetRequest
