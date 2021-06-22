import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import PageInfoDateCursor from './PageInfoDateCursor'
import StandardMutationError from './StandardMutationError'
import Story, {storyFields} from './Story'
import ThreadSource from './ThreadSource'

const GitHubIssue = new GraphQLObjectType<any, GQLContext>({
  name: 'GitHubIssue',
  description: 'The GitHub Issue that comes direct from GitHub',
  interfaces: () => [Story, ThreadSource],
  isTypeOf: ({nameWithOwner}) => !!nameWithOwner,
  fields: () => ({
    ...storyFields(),
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the issue as found in GitHub'
    },
    url: {
      type: GraphQLNonNull(GraphQLURLType),
      description: 'The url to access the issue'
      // resolve: ({cloudName, key}) => {
      //   return `https://${cloudName}.atlassian.net/browse/${key}`
      // }
    },
    nameWithOwner: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The owner / repo of the issue as found in GitHub'
    },
    // summary: {
    //   type: GraphQLNonNull(GraphQLString),
    //   description: 'The plaintext summary of the jira issue'
    // },
    title: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Alias for summary used by the Story interface',
      resolve: ({summary}) => {
        return summary
      }
    },
    description: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The stringified ADF of the jira issue description',
      resolve: ({description}) => (description ? JSON.stringify(description) : '')
    }
    // descriptionHTML: {
    //   type: GraphQLNonNull(GraphQLString),
    //   description: 'The description converted into raw HTML'
    // }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: GitHubIssue.name,
  nodeType: GitHubIssue,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    },
    error: {
      type: StandardMutationError,
      description: 'An error with the connection, if any'
    }
  })
})

export const GitHubIssueConnection = connectionType
export const GitHubIssueEdge = edgeType
export default GitHubIssue
