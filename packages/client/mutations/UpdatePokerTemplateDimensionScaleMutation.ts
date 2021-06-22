import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdatePokerTemplateDimensionScaleMutation as TUpdatePokerTemplateDimensionScaleMutation} from '../__generated__/UpdatePokerTemplateDimensionScaleMutation.graphql'

graphql`
  fragment UpdatePokerTemplateDimensionScaleMutation_dimension on UpdatePokerTemplateDimensionScalePayload {
    dimension {
      ...SelectScaleDropdown_dimension
    }
  }
`

const mutation = graphql`
  mutation UpdatePokerTemplateDimensionScaleMutation($dimensionId: ID!, $scaleId: ID!) {
    updatePokerTemplateDimensionScale(dimensionId: $dimensionId, scaleId: $scaleId) {
      error {
        message
      }
      ...UpdatePokerTemplateDimensionScaleMutation_dimension @relay(mask: false)
    }
  }
`

const UpdatePokerTemplateDimensionScaleMutation: StandardMutation<TUpdatePokerTemplateDimensionScaleMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdatePokerTemplateDimensionScaleMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {dimensionId, scaleId} = variables
      const dimension = store.get(dimensionId)
      const scale = store.get(scaleId)
      if (!dimension || !scale) return
      dimension.setLinkedRecord(scale, 'selectedScale')
    },
    onCompleted,
    onError
  })
}

export default UpdatePokerTemplateDimensionScaleMutation
