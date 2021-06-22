import {Variables} from 'relay-runtime'
import ServerAuthToken from '../database/types/ServerAuthToken'
import getGraphQLExecutor from './getGraphQLExecutor'
import sendToSentry from './sendToSentry'

const publishWebhookGQL = async (query: string, variables: Variables) => {
  try {
    return await getGraphQLExecutor().publish({
      authToken: new ServerAuthToken(),
      query,
      variables,
      isPrivate: true
    })
  } catch (e) {
    sendToSentry(e, {tags: {query: query.slice(0, 50)}})
    return undefined
  }
}

export default publishWebhookGQL
