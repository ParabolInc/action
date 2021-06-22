import {GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../../graphql'
import DomainCountPayload from './DomainCountPayload'
import authCount from '../queries/helpers/authCount'
import authCountByDomain from '../queries/helpers/authCountByDomain'

const SignupsPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'SignupsPayload',
  fields: () => ({
    total: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'the total number of signups for the given time range',
      resolve: async ({after, isActive}) => {
        return authCount(after, isActive, 'createdAt')
      }
    },
    byDomain: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(DomainCountPayload))),
      description: 'The total broken down by email domain',
      resolve: async ({after, isActive}) => {
        return authCountByDomain(after, isActive, 'createdAt')
      }
    }
  })
})

export default SignupsPayload
