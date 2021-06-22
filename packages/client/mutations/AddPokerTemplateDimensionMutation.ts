import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SprintPokerDefaults} from '~/types/constEnums'
import {BaseLocalHandlers, SharedUpdater, StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {AddPokerTemplateDimensionMutation as TAddPokerTemplateDimensionMutation} from '../__generated__/AddPokerTemplateDimensionMutation.graphql'
import {AddPokerTemplateDimensionMutation_dimension} from '../__generated__/AddPokerTemplateDimensionMutation_dimension.graphql'
import handleAddPokerTemplateDimension from './handlers/handleAddPokerTemplateDimension'

interface Handlers extends BaseLocalHandlers {
  dimensionCount: number
  sortOrder: number
}

graphql`
  fragment AddPokerTemplateDimensionMutation_dimension on AddPokerTemplateDimensionPayload {
    dimension {
      ...AddPokerTemplateDimension_dimensions @relay(mask: false)
      ...TemplateDimensionList_dimensions @relay(mask: false)
      ...PokerTemplateScalePicker_dimension @relay(mask: false)
      id
      name
      sortOrder
      templateId
    }
  }
`

const mutation = graphql`
  mutation AddPokerTemplateDimensionMutation($templateId: ID!) {
    addPokerTemplateDimension(templateId: $templateId) {
      ...AddPokerTemplateDimensionMutation_dimension @relay(mask: false)
    }
  }
`

export const addPokerTemplateDimensionTeamUpdater: SharedUpdater<AddPokerTemplateDimensionMutation_dimension> = (
  payload,
  {store}
) => {
  const dimension = payload.getLinkedRecord('dimension')
  if (!dimension) return
  handleAddPokerTemplateDimension(dimension, store)
}

const AddPokerTemplateDimensionMutation: StandardMutation<
  TAddPokerTemplateDimensionMutation,
  Handlers
> = (atmosphere, variables, {dimensionCount, sortOrder, onError, onCompleted}) => {
  return commitMutation<TAddPokerTemplateDimensionMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('addPokerTemplateDimension')
      if (!payload) return
      addPokerTemplateDimensionTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {templateId} = variables
      const nowISO = new Date().toJSON()
      const defaultScale = store.get(SprintPokerDefaults.DEFAULT_SCALE_ID)
      const template = store.get(templateId)
      if (!defaultScale || !template) return
      const proxyTemplateDimension = createProxyRecord(store, 'PokerTemplateDimension', {
        createdAt: nowISO,
        name: `*New Dimension #${dimensionCount + 1}`,
        description: '',
        scaleId: SprintPokerDefaults.DEFAULT_SCALE_ID,
        sortOrder,
        templateId,
      })
      proxyTemplateDimension.setLinkedRecord(defaultScale, 'selectedScale')
      proxyTemplateDimension.setLinkedRecord(template, 'template')
      handleAddPokerTemplateDimension(proxyTemplateDimension, store)
    }
  })
}

export default AddPokerTemplateDimensionMutation
