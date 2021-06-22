import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import getInProxy from '../utils/relay/getInProxy'
import {RemoveAgendaItemMutation as TRemoveAgendaItemMutation} from '../__generated__/RemoveAgendaItemMutation.graphql'
import handleRemoveAgendaItems from './handlers/handleRemoveAgendaItems'

graphql`
  fragment RemoveAgendaItemMutation_team on RemoveAgendaItemPayload {
    agendaItem {
      id
    }
    meeting {
      id
      facilitatorStageId
      phases {
        ...ActionSidebarAgendaItemsSectionAgendaItemPhase @relay(mask: false)
      }
    }
  }
`

const mutation = graphql`
  mutation RemoveAgendaItemMutation($agendaItemId: ID!) {
    removeAgendaItem(agendaItemId: $agendaItemId) {
      error {
        message
      }
      ...RemoveAgendaItemMutation_team @relay(mask: false)
    }
  }
`

export const removeAgendaItemUpdater = (payload, {store}) => {
  const agendaItemId = getInProxy(payload, 'agendaItem', 'id')
  const meetingId = getInProxy(payload, 'meeting', 'id')
  handleRemoveAgendaItems(agendaItemId, store, meetingId)
}

const RemoveAgendaItemMutation: StandardMutation<
  TRemoveAgendaItemMutation,
  {meetingId?: string}
> = (atmosphere, variables, {meetingId}) => {
  return commitMutation<TRemoveAgendaItemMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeAgendaItem')
      if (!payload) return
      removeAgendaItemUpdater(payload, {store})
    },
    optimisticUpdater: (store) => {
      const {agendaItemId} = variables
      handleRemoveAgendaItems(agendaItemId, store, meetingId)
    }
  })
}

export default RemoveAgendaItemMutation
