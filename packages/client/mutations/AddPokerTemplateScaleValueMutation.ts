import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import dndNoise from '../utils/dndNoise'
import addNodeToArray from '../utils/relay/addNodeToArray'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {AddPokerTemplateScaleValueMutation as TAddPokerTemplateScaleValueMutation} from '../__generated__/AddPokerTemplateScaleValueMutation.graphql'

graphql`
  fragment AddPokerTemplateScaleValueMutation_scale on AddPokerTemplateScaleValuePayload {
    scale {
      ...NewTemplateScaleValueLabelInput_scale
    }
  }
`

const mutation = graphql`
  mutation AddPokerTemplateScaleValueMutation($scaleId: ID!, $scaleValue: AddTemplateScaleInput!) {
    addPokerTemplateScaleValue(scaleId: $scaleId, scaleValue: $scaleValue) {
      ...AddPokerTemplateScaleValueMutation_scale @relay(mask: false)
    }
  }
`

const AddPokerTemplateScaleValueMutation: StandardMutation<
  TAddPokerTemplateScaleValueMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TAddPokerTemplateScaleValueMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {scaleValue, scaleId} = variables
      const scale = store.get(scaleId)
      if (!scale) return
      const values = scale.getLinkedRecords('values')
      if (!values) return
      const proxyTemplateScaleValue = createProxyRecord(store, 'TemplateScaleValue', {
        ...scaleValue,
        sortOrder: values.length - 2 - dndNoise() // Append at the end of the sub-array (minus ? and Pass)
      })
      addNodeToArray(proxyTemplateScaleValue, scale, 'values', 'sortOrder')
    }
  })
}

export default AddPokerTemplateScaleValueMutation
