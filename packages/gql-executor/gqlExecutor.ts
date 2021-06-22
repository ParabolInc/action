import Redis from 'ioredis'
import {ServerChannel} from 'parabol-client/types/constEnums'

const {REDIS_URL} = process.env
const publisher = new Redis(REDIS_URL)
const subscriber = new Redis(REDIS_URL)

interface PubSubPromiseMessage {
  jobId: string
  request: Record<string, unknown>
}

const onMessage = async (_channel: string, message: string) => {
  const {jobId, request} = JSON.parse(message) as PubSubPromiseMessage
  const executeGraphQL = require('../server/graphql/executeGraphQL').default
  const response = await executeGraphQL(request)
  publisher.publish(
    ServerChannel.GQL_EXECUTOR_RESPONSE,
    JSON.stringify({response, jobId})
  )
}

subscriber.on('message', onMessage)
subscriber.subscribe(ServerChannel.GQL_EXECUTOR_REQUEST)
console.log(`\n💧💧💧 Ready for GraphQL Execution 💧💧💧`)
