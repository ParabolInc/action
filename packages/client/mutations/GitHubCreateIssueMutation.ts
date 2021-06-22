import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {GitHubCreateIssueMutation as TGitHubCreateIssueMutation} from '../__generated__/GitHubCreateIssueMutation.graphql'

graphql`
  fragment GitHubCreateIssueMutation_meeting on GitHubCreateIssueSuccess {
    gitHubIssue {
      id
      url
      nameWithOwner
      title
      description
    }
    meetingId
    teamId
  }
`

const mutation = graphql`
  mutation GitHubCreateIssueMutation(
    $nameWithOwner: String!
    $title: String!
    $teamId: ID!
    $meetingId: ID!
  ) {
    gitHubCreateIssue(
      nameWithOwner: $nameWithOwner
      title: $title
      teamId: $teamId
      meetingId: $meetingId
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...GitHubCreateIssueMutation_meeting @relay(mask: false)
    }
  }
`

const GitHubCreateIssueMutation: StandardMutation<TGitHubCreateIssueMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TGitHubCreateIssueMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default GitHubCreateIssueMutation
