import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const ServiceField = new GraphQLObjectType<any, GQLContext>({
  name: 'ServiceField',
  description: 'A field that exists on a 3rd party service',
  fields: () => ({
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The name of the field as provided by the service'
    },
    type: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The field type, to be used for validation and analytics'
    }
  })
})

export default ServiceField
