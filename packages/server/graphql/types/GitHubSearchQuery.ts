import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'

const GitHubSearchQuery = new GraphQLObjectType<any, GQLContext>({
  name: 'GitHubSearchQuery',
  description: 'A GitHub search query including all filters selected when the query was executed',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    queryString: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The query string, either simple or JQL depending on the isJQL flag'
    },
    nameWithOwnerFilters: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID))),
      description: 'The list of repos selected as a filter. null if not set',
      resolve: ({nameWithOwnerFilters}) => nameWithOwnerFilters || []
    },
    lastUsedAt: {
      type: GraphQLNonNull(GraphQLISO8601Type),
      description: 'the time the search query was last used. Used for sorting'
    }
  })
})

export default GitHubSearchQuery
