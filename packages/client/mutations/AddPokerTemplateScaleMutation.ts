import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {AddPokerTemplateScaleMutation_scale} from '../__generated__/AddPokerTemplateScaleMutation_scale.graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {AddPokerTemplateScaleMutation as TAddPokerTemplateScaleMutation} from '../__generated__/AddPokerTemplateScaleMutation.graphql'
import handleAddPokerTemplateScale from './handlers/handleAddPokerTemplateScale'
import {PokerCards} from '../types/constEnums'
import {PALETTE} from '../styles/paletteV3'

graphql`
  fragment AddPokerTemplateScaleMutation_scale on AddPokerTemplateScalePayload {
    scale {
      id
      name
      values {
        label
        color
      }
      teamId
    }
  }
`

const mutation = graphql`
  mutation AddPokerTemplateScaleMutation($parentScaleId: ID, $teamId: ID!) {
    addPokerTemplateScale(parentScaleId: $parentScaleId, teamId: $teamId) {
      ...AddPokerTemplateScaleMutation_scale @relay(mask: false)
    }
  }
`

export const addPokerTemplateScaleTeamUpdater: SharedUpdater<AddPokerTemplateScaleMutation_scale> = (
  payload,
  {store}
) => {
  const scale = payload.getLinkedRecord('scale')
  if (!scale) return
  const scaleId = scale.getValue('id')
  handleAddPokerTemplateScale(scale, store)
  const teamId = scale.getValue('teamId')
  const team = store.get(teamId)!
  team.setValue(scaleId, 'editingScaleId')
}

const AddPokerTemplateScaleMutation: StandardMutation<
  TAddPokerTemplateScaleMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TAddPokerTemplateScaleMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('addPokerTemplateScale')
      if (!payload) return
      addPokerTemplateScaleTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {parentScaleId, teamId} = variables
      const team = store.get(teamId)!
      const parentScale = parentScaleId ? store.get(parentScaleId) : null
      const scaleName = parentScale ? parentScale.getValue('name') + ' Copy' : '*New Scale'
      const proxyScale = createProxyRecord(store, 'TemplateScale', {
        name: scaleName
      })
      proxyScale.setLinkedRecord(team, 'team')

      if (parentScale) {
        const currentScaleValues = parentScale.getLinkedRecords('values')!
        proxyScale.setLinkedRecords(currentScaleValues, 'values')
      } else {
        const questionMarkCard = createProxyRecord(store, 'TemplateScaleValue', {
          color: PALETTE.FUSCIA_400,
          label: PokerCards.QUESTION_CARD,
        })
        const passCard = createProxyRecord(store, 'TemplateScaleValue', {
          color: PALETTE.GRAPE_500,
          label: PokerCards.PASS_CARD,
        })
        proxyScale.setLinkedRecords([questionMarkCard, passCard], 'values')
      }

      handleAddPokerTemplateScale(proxyScale, store)
    }
  })
}

export default AddPokerTemplateScaleMutation
