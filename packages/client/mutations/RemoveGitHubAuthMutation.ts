import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {RemoveGitHubAuthMutation as TRemoveGitHubAuthMutation} from '../__generated__/RemoveGitHubAuthMutation.graphql'

graphql`
  fragment RemoveGitHubAuthMutation_team on RemoveGitHubAuthPayload {
    teamMember {
      integrations {
        github {
          ...GitHubProviderRowGitHubIntegration @relay(mask: false)
        }
      }
    }
  }
`

const mutation = graphql`
  mutation RemoveGitHubAuthMutation($teamId: ID!) {
    removeGitHubAuth(teamId: $teamId) {
      error {
        message
      }
      ...RemoveGitHubAuthMutation_team @relay(mask: false)
    }
  }
`

const RemoveGitHubAuthMutation: StandardMutation<TRemoveGitHubAuthMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemoveGitHubAuthMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted
  })
}

export default RemoveGitHubAuthMutation
