import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'
import {UpdatePokerTemplateScaleValueMutation as TUpdatePokerTemplateScaleValueMutation} from '../__generated__/UpdatePokerTemplateScaleValueMutation.graphql'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'
import createProxyRecord from '~/utils/relay/createProxyRecord'
import addNodeToArray from '~/utils/relay/addNodeToArray'

graphql`
  fragment UpdatePokerTemplateScaleValueMutation_scale on UpdatePokerTemplateScaleValuePayload {
    scale {
      id
      values {
        ...EditableTemplateScaleValueLabel_scaleValue
      }
    }
  }
`

const mutation = graphql`
  mutation UpdatePokerTemplateScaleValueMutation(
    $scaleId: ID!
    $oldScaleValue: TemplateScaleInput!
    $newScaleValue: TemplateScaleInput!
  ) {
    updatePokerTemplateScaleValue(
      scaleId: $scaleId
      oldScaleValue: $oldScaleValue
      newScaleValue: $newScaleValue
    ) {
      error {
        message
      }
      ...UpdatePokerTemplateScaleValueMutation_scale @relay(mask: false)
    }
  }
`

const UpdatePokerTemplateScaleValueMutation: StandardMutation<TUpdatePokerTemplateScaleValueMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdatePokerTemplateScaleValueMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {scaleId, oldScaleValue, newScaleValue} = variables
      const scale = store.get(scaleId)
      if (!scale) return
      const oldScaleValueId = `${scaleId}:${oldScaleValue.label}`
      const sortOrder = store.get(oldScaleValueId)?.getValue('sortOrder')
      safeRemoveNodeFromArray(oldScaleValueId, scale, 'values')

      const proxyScaleValue = createProxyRecord(store, 'TemplateScaleValue', {
        ...newScaleValue,
        sortOrder: sortOrder
      })
      addNodeToArray(proxyScaleValue, scale, 'values', 'sortOrder')
    }
  })
}

export default UpdatePokerTemplateScaleValueMutation
