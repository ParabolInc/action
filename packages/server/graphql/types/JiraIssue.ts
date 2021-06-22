import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import PageInfoDateCursor from './PageInfoDateCursor'
import StandardMutationError from './StandardMutationError'
import Story, {storyFields} from './Story'
import ThreadSource from './ThreadSource'

const JiraIssue = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraIssue',
  description: 'The Jira Issue that comes direct from Jira',
  interfaces: () => [Story, ThreadSource],
  isTypeOf: ({cloudId, key}) => !!(cloudId && key),
  fields: () => ({
    ...storyFields(),
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'cloudId:key. equal to the serviceTaskId on the EstimateStage'
    },
    cloudId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The ID of the jira cloud where the issue lives'
    },
    cloudName: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The name of the jira cloud where the issue lives'
    },
    url: {
      type: GraphQLNonNull(GraphQLURLType),
      description: 'The url to access the issue',
      resolve: ({cloudName, key}) => {
        return `https://${cloudName}.atlassian.net/browse/${key}`
      }
    },
    key: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The key of the issue as found in Jira'
    },
    summary: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The plaintext summary of the jira issue'
    },
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
    },
    descriptionHTML: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The description converted into raw HTML'
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: JiraIssue.name,
  nodeType: JiraIssue,
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

export const JiraIssueConnection = connectionType
export const JiraIssueEdge = edgeType
export default JiraIssue
