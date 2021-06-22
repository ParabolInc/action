import {GraphQLInt, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../../graphql'
import {GraphQLID} from 'graphql'

const DomainCountPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'DomainCountPayload',
  fields: () => ({
    domain: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the email domain'
    },
    total: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'the sum total'
    }
  })
})

export default DomainCountPayload
