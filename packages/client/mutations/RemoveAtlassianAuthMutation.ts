import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {RemoveAtlassianAuthMutation as TRemoveAtlassianAuthMutation} from '../__generated__/RemoveAtlassianAuthMutation.graphql'

graphql`
  fragment RemoveAtlassianAuthMutation_team on RemoveAtlassianAuthPayload {
    teamMember {
      integrations {
        atlassian {
          ...AtlassianProviderRowAtlassianIntegration @relay(mask: false)
        }
      }
    }
  }
`

const mutation = graphql`
  mutation RemoveAtlassianAuthMutation($teamId: ID!) {
    removeAtlassianAuth(teamId: $teamId) {
      error {
        message
      }
      ...RemoveAtlassianAuthMutation_team @relay(mask: false)
    }
  }
`

const RemoveAtlassianAuthMutation: StandardMutation<TRemoveAtlassianAuthMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemoveAtlassianAuthMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted
  })
}

export default RemoveAtlassianAuthMutation
