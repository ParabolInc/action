import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {MovePokerTemplateScaleValueMutation as TMovePokerTemplateScaleValueMutation} from '../__generated__/MovePokerTemplateScaleValueMutation.graphql'

graphql`
  fragment MovePokerTemplateScaleValueMutation_team on MovePokerTemplateScaleValueSuccess {
    scale {
      ...TemplateScaleValueList_scale
    }
  }
`

const mutation = graphql`
  mutation MovePokerTemplateScaleValueMutation($scaleId: ID!, $label: String!, $index: Int!) {
    movePokerTemplateScaleValue(scaleId: $scaleId, label: $label, index: $index) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...MovePokerTemplateScaleValueMutation_team @relay(mask: false)
    }
  }
`

const MovePokerTemplateScaleValueMutation: StandardMutation<TMovePokerTemplateScaleValueMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TMovePokerTemplateScaleValueMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {scaleId, label, index: toIndex} = variables
      const scale = store.get(scaleId)
      if (!scale) return
      const scaleValueId = `${scaleId}:${label}`
      const scaleValue = store.get(scaleValueId)!
      const fromIndex = scaleValue.getValue('sortOrder') as number
      if (fromIndex === toIndex) return

      const values = scale.getLinkedRecords('values')
      if (!values) return
      if (fromIndex < toIndex) {
        for (let ii = toIndex; ii > fromIndex; ii--) {
          const value = values[ii]
          value.setValue(value.getValue('sortOrder') as number - 1, 'sortOrder')
        }
        values[fromIndex].setValue(toIndex, 'sortOrder')
      } else { // fromIndex > toIndex
        for (let ii = toIndex; ii < fromIndex; ii++) {
          const value = values[ii]
          value.setValue(value.getValue('sortOrder') as number + 1, 'sortOrder')
        }
        values[fromIndex].setValue(toIndex, 'sortOrder')
      }
      scale.setLinkedRecords(values.sort((a, b) => (a.getValue('sortOrder')! < b.getValue('sortOrder')! ? -1 : 1)), "values")
    },
    onCompleted,
    onError
  })
}

export default MovePokerTemplateScaleValueMutation
