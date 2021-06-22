import {GraphQLID, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'

const InvalidateSessionsPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'InvalidateSessionsPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    authToken: {
      type: GraphQLID,
      description: 'The new, only valid auth token'
    }
  })
})

export default InvalidateSessionsPayload
