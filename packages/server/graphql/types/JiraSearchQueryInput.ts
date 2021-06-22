import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'

const JiraSearchQueryInput = new GraphQLInputObjectType({
  name: 'JiraSearchQueryInput',
  fields: () => ({
    queryString: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The query string, either simple or JQL depending on the isJQL flag'
    },
    isJQL: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the queryString is JQL, else false'
    },
    projectKeyFilters: {
      type: GraphQLList(GraphQLNonNull(GraphQLID)),
      description: 'The list of project keys selected as a filter. null if not set'
    },
    isRemove: {
      type: GraphQLBoolean,
      description: 'true if this query should be deleted'
    }
  })
})

export default JiraSearchQueryInput
