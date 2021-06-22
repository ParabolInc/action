import {GraphQLMessageType} from '../graphql/handleGraphQLTrebuchetRequest'
import ConnectionContext from './ConnectionContext'
import {sendEncodedMessage} from './sendEncodedMessage'

interface Message {
  type: string
  syn: boolean
  payload?: Record<string, any>
  id?: string
}

const sendGQLMessage = (
  context: ConnectionContext,
  type: GraphQLMessageType,
  syn: boolean,
  payload?: Record<string, any>,
  opId?: string
) => {
  const message = {type} as Message
  if (payload) message.payload = payload
  if (opId) message.id = opId

  sendEncodedMessage(context, message, syn)
}

export default sendGQLMessage
