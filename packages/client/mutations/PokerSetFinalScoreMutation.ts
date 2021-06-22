import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {PokerSetFinalScoreMutation as TPokerSetFinalScoreMutation} from '../__generated__/PokerSetFinalScoreMutation.graphql'

graphql`
  fragment PokerSetFinalScoreMutation_meeting on PokerSetFinalScoreSuccess {
    stage {
      finalScore
    }
  }
`

const mutation = graphql`
  mutation PokerSetFinalScoreMutation($meetingId: ID!, $stageId: ID!, $finalScore: String!) {
    pokerSetFinalScore(meetingId: $meetingId, stageId: $stageId, finalScore: $finalScore) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...PokerSetFinalScoreMutation_meeting @relay(mask: false)
    }
  }
`

const PokerSetFinalScoreMutation: StandardMutation<TPokerSetFinalScoreMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TPokerSetFinalScoreMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {stageId, finalScore} = variables
      const stage = store.get(stageId)
      if (!stage) return
      stage.setValue(finalScore, 'finalScore')
    },
    onCompleted,
    onError
  })
}

export default PokerSetFinalScoreMutation
