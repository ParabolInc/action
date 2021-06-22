import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import GitHubIssue from './GitHubIssue'
import makeMutationPayload from './makeMutationPayload'

export const GitHubCreateIssueSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'GitHubCreateIssueSuccess',
  fields: () => ({
    gitHubIssue: {
      type: GraphQLNonNull(GitHubIssue),
      description: 'The GitHub Issue that comes directly from GitHub'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the meeting where the GitHub issue is being created'
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the team that is creating the GitHub issue'
    }
  })
})

const GitHubCreateIssuePayload = makeMutationPayload(
  'GitHubCreateIssuePayload',
  GitHubCreateIssueSuccess
)

export default GitHubCreateIssuePayload
