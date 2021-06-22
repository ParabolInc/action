import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'
import {RemovePokerTemplateScaleValueMutation as IRemovePokerTemplateScaleValueMutation} from '../__generated__/RemovePokerTemplateScaleValueMutation.graphql'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'

graphql`
  fragment RemovePokerTemplateScaleValueMutation_scale on RemovePokerTemplateScaleValuePayload {
    scale {
      ...TemplateScaleValueItem_scale
    }
  }
`

const mutation = graphql`
  mutation RemovePokerTemplateScaleValueMutation($scaleId: ID!, $label: String!) {
    removePokerTemplateScaleValue(scaleId: $scaleId, label: $label) {
      ...RemovePokerTemplateScaleValueMutation_scale @relay(mask: false)
    }
  }
`

const RemovePokerTemplateScaleValueMutation: StandardMutation<IRemovePokerTemplateScaleValueMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<IRemovePokerTemplateScaleValueMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {scaleId, label} = variables
      const scale = store.get(scaleId)
      if (!scale) return
      const scaleValueId = `${scale.getDataID()}:${label}`
      safeRemoveNodeFromArray(scaleValueId, scale, 'values')
    }
  })
}

export default RemovePokerTemplateScaleValueMutation
