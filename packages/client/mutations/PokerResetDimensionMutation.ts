import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {PokerResetDimensionMutation as TPokerResetDimensionMutation} from '../__generated__/PokerResetDimensionMutation.graphql'

graphql`
  fragment PokerResetDimensionMutation_meeting on PokerResetDimensionSuccess {
    stage {
      isVoting
      scores {
        ...PokerVotingRow_scores
        userId
        label
      }
      finalScore
    }
  }
`

const mutation = graphql`
  mutation PokerResetDimensionMutation($meetingId: ID!, $stageId: ID!) {
    pokerResetDimension(meetingId: $meetingId, stageId: $stageId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...PokerResetDimensionMutation_meeting @relay(mask: false)
    }
  }
`

const PokerResetDimensionMutation: StandardMutation<TPokerResetDimensionMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TPokerResetDimensionMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {stageId} = variables
      const stage = store.get(stageId)
      if (!stage) return
      stage.setValue(true, 'isVoting')
      stage.setLinkedRecords([], 'scores')
      stage.setValue(null, 'finalScore')
    },
    onCompleted,
    onError
  })
}

export default PokerResetDimensionMutation
