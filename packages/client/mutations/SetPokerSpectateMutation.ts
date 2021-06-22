import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import {SetPokerSpectateMutation as TSetPokerSpectateMutation} from '../__generated__/SetPokerSpectateMutation.graphql'

graphql`
  fragment SetPokerSpectateMutation_team on SetPokerSpectateSuccess {
    meetingMember {
      isSpectating
    }
  }
`

const mutation = graphql`
  mutation SetPokerSpectateMutation($meetingId: ID!, $isSpectating: Boolean!) {
    setPokerSpectate(meetingId: $meetingId, isSpectating: $isSpectating) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...SetPokerSpectateMutation_team @relay(mask: false)
    }
  }
`

const SetPokerSpectateMutation: StandardMutation<TSetPokerSpectateMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetPokerSpectateMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {isSpectating, meetingId} = variables
      const meetingMemberId = toTeamMemberId(meetingId, viewerId)
      const meetingMember = store.get(meetingMemberId)
      if (!meetingMember) return
      meetingMember.setValue(isSpectating, 'isSpectating')
    },
    onCompleted,
    onError
  })
}

export default SetPokerSpectateMutation
