import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {
  FlagReadyToAdvanceMutation as TFlagReadyToAdvanceMutation,
  FlagReadyToAdvanceMutationResponse
} from '../__generated__/FlagReadyToAdvanceMutation.graphql'

graphql`
  fragment FlagReadyToAdvanceMutation_meeting on FlagReadyToAdvanceSuccess {
    stage {
      isViewerReady
      readyCount
    }
  }
`

const mutation = graphql`
  mutation FlagReadyToAdvanceMutation($stageId: ID!, $meetingId: ID!, $isReady: Boolean!) {
    flagReadyToAdvance(stageId: $stageId, meetingId: $meetingId, isReady: $isReady) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...FlagReadyToAdvanceMutation_meeting @relay(mask: false)
    }
  }
`

type Stage = NonNullable<
  NonNullable<FlagReadyToAdvanceMutationResponse['flagReadyToAdvance']>['stage']
>

const FlagReadyToAdvanceMutation: SimpleMutation<TFlagReadyToAdvanceMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TFlagReadyToAdvanceMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {stageId, isReady} = variables
      const stage = store.get<Stage>(stageId)
      if (!stage) return
      const currentCount = stage.getValue('readyCount')
      const diff = isReady ? 1 : -1
      const nextCount = currentCount + diff
      stage.setValue(nextCount, 'readyCount')
      stage.setValue(isReady, 'isReady')
    }
  })
}

export default FlagReadyToAdvanceMutation
