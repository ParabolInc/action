import {GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../../graphql'
import DomainCountPayload from './DomainCountPayload'
import authCount from '../queries/helpers/authCount'
import authCountByDomain from '../queries/helpers/authCountByDomain'

const LoginsPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'LoginsPayload',
  fields: () => ({
    total: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'the total number of records',
      resolve: async ({after, isActive}) => {
        return authCount(after, isActive, 'lastSeenAt')
      }
    },
    byDomain: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(DomainCountPayload))),
      description: 'The total broken down by email domain',
      resolve: async ({after, isActive}) => {
        return authCountByDomain(after, isActive, 'lastSeenAt')
      }
    }
  })
})

export default LoginsPayload
