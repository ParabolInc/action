import {ExecutionResult} from 'graphql'
import {ServerChannel} from 'parabol-client/types/constEnums'
import {GQLRequest} from '../graphql/executeGraphQL'
import PubSubPromise from './PubSubPromise'

let pubsub: PubSubPromise<GQLRequest, ExecutionResult>
const getGraphQLExecutor = () => {
  if (!pubsub) {
    pubsub = new PubSubPromise(
      ServerChannel.GQL_EXECUTOR_REQUEST,
      ServerChannel.GQL_EXECUTOR_RESPONSE
    )
  }
  return pubsub
}
export default getGraphQLExecutor
