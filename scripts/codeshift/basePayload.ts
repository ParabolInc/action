import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

export const SUCCESS_PAYLOAD = new GraphQLObjectType<any, GQLContext>({
  name: 'SUCCESS_PAYLOAD',
  fields: () => ({

  })
})

const MUTATION_PAYLOAD = makeMutationPayload(
  'MUTATION_PAYLOAD',
  SUCCESS_PAYLOAD
)

export default MUTATION_PAYLOAD
