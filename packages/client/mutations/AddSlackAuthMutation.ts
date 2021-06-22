import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'
import {AddSlackAuthMutation as TAddSlackAuthMutation} from '../__generated__/AddSlackAuthMutation.graphql'

graphql`
  fragment AddSlackAuthMutation_team on AddSlackAuthPayload {
    user {
      ...SlackNotificationList_viewer
      ...SlackProviderRow_viewer
      teamMember(teamId: $teamId) {
        ...StageTimerModalEndTimeSlackToggle_facilitator
      }
    }
  }
`

const mutation = graphql`
  mutation AddSlackAuthMutation($code: ID!, $teamId: ID!) {
    addSlackAuth(code: $code, teamId: $teamId) {
      error {
        message
      }
      ...AddSlackAuthMutation_team @relay(mask: false)
    }
  }
`

const AddSlackAuthMutation: StandardMutation<TAddSlackAuthMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddSlackAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddSlackAuthMutation
