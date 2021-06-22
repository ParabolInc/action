import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import handleMovePokerTemplateDimension from './handlers/handleMovePokerTemplateDimension'
import getInProxy from '../utils/relay/getInProxy'
import {MovePokerTemplateDimensionMutation as TMovePokerTemplateDimensionMutation} from '~/__generated__/MovePokerTemplateDimensionMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment MovePokerTemplateDimensionMutation_team on MovePokerTemplateDimensionPayload {
    dimension {
      sortOrder
      templateId
    }
  }
`

const mutation = graphql`
  mutation MovePokerTemplateDimensionMutation($dimensionId: ID!, $sortOrder: Float!) {
    movePokerTemplateDimension(dimensionId: $dimensionId, sortOrder: $sortOrder) {
      error {
        message
      }
      ...MovePokerTemplateDimensionMutation_team @relay(mask: false)
    }
  }
`

export const movePokerTemplateDimensionTeamUpdater = (payload, {store}) => {
  if (!payload) return
  const templateId = getInProxy(payload, 'dimension', 'templateId')
  handleMovePokerTemplateDimension(store, templateId)
}

const MovePokerTemplateDimensionMutation: StandardMutation<
  TMovePokerTemplateDimensionMutation,
  {templateId: string}
> = (atmosphere, variables, {templateId}) => {
  return commitMutation<TMovePokerTemplateDimensionMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('movePokerTemplateDimension')
      if (!payload) return
      movePokerTemplateDimensionTeamUpdater(payload, {store})
    },
    optimisticUpdater: (store) => {
      const {sortOrder, dimensionId} = variables
      const dimension = store.get(dimensionId)
      if (!dimension) return
      dimension.setValue(sortOrder, 'sortOrder')
      handleMovePokerTemplateDimension(store, templateId)
    }
  })
}

export default MovePokerTemplateDimensionMutation
