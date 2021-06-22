import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {PokerRevealVotesMutation as TPokerRevealVotesMutation} from '../__generated__/PokerRevealVotesMutation.graphql'

graphql`
  fragment PokerRevealVotesMutation_meeting on PokerRevealVotesSuccess {
    stage {
      isVoting
      scores {
        ...PokerVotingRow_scores
        label
      }
    }
  }
`

const mutation = graphql`
  mutation PokerRevealVotesMutation($meetingId: ID!, $stageId: ID!) {
    pokerRevealVotes(meetingId: $meetingId, stageId: $stageId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...PokerRevealVotesMutation_meeting @relay(mask: false)
    }
  }
`

const PokerRevealVotesMutation: StandardMutation<TPokerRevealVotesMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TPokerRevealVotesMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {stageId} = variables
      const stage = store.get(stageId)
      if (!stage) return
      stage.setValue(false, 'isVoting')
    },
    onCompleted,
    onError
  })
}

export default PokerRevealVotesMutation
