import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import handleRemovePokerTemplateDimension from './handlers/handleRemovePokerTemplateDimension'
import {RemovePokerTemplateDimensionMutation_team} from '../__generated__/RemovePokerTemplateDimensionMutation_team.graphql'
import {RemovePokerTemplateDimensionMutation as IRemovePokerTemplateDimensionMutation} from '../__generated__/RemovePokerTemplateDimensionMutation.graphql'
import getInProxy from '~/utils/relay/getInProxy'

graphql`
  fragment RemovePokerTemplateDimensionMutation_team on RemovePokerTemplateDimensionPayload {
    dimension {
      id
      teamId
    }
  }
`

const mutation = graphql`
  mutation RemovePokerTemplateDimensionMutation($dimensionId: ID!) {
    removePokerTemplateDimension(dimensionId: $dimensionId) {
      ...RemovePokerTemplateDimensionMutation_team @relay(mask: false)
    }
  }
`

export const removePokerTemplateDimensionTeamUpdater: SharedUpdater<RemovePokerTemplateDimensionMutation_team> = (
  payload,
  {store}
) => {
  const dimensionId = getInProxy(payload, 'dimension', 'id')
  const teamId = getInProxy(payload, 'dimension', 'teamId')
  handleRemovePokerTemplateDimension(dimensionId, teamId, store)
}

const RemovePokerTemplateDimensionMutation: StandardMutation<IRemovePokerTemplateDimensionMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<IRemovePokerTemplateDimensionMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removePokerTemplateDimension')
      if (!payload) return
      removePokerTemplateDimensionTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {dimensionId} = variables
      const dimension = store.get(dimensionId)
      if (!dimension) return
      const teamId = dimension.getValue('teamId') as string
      if (!teamId) return
      handleRemovePokerTemplateDimension(dimensionId, teamId, store)
    }
  })
}

export default RemovePokerTemplateDimensionMutation
