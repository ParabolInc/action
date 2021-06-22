import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import handleUpdateAgendaItems from './handlers/handleUpdateAgendaItems'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import updateProxyRecord from '../utils/relay/updateProxyRecord'
import {UpdateAgendaItemMutation as TUpdateAgendaItemMutation} from '../__generated__/UpdateAgendaItemMutation.graphql'
import {UpdateAgendaItemMutation_team} from '~/__generated__/UpdateAgendaItemMutation_team.graphql'
import {ActionMeeting_meeting} from '~/__generated__/ActionMeeting_meeting.graphql'
import {AgendaItem_agendaItem} from '~/__generated__/AgendaItem_agendaItem.graphql'

graphql`
  fragment UpdateAgendaItemMutation_team on UpdateAgendaItemPayload {
    agendaItem {
      id
      teamId
      pinned
      sortOrder
    }
    meetingId
  }
`

const mutation = graphql`
  mutation UpdateAgendaItemMutation($updatedAgendaItem: UpdateAgendaItemInput!) {
    updateAgendaItem(updatedAgendaItem: $updatedAgendaItem) {
      error {
        message
      }
      ...UpdateAgendaItemMutation_team @relay(mask: false)
    }
  }
`

const handleUpdateAgendaPhase = (
  store: RecordSourceSelectorProxy,
  meetingId: string | undefined | null
) => {
  if (meetingId) {
    const meeting = store.get(meetingId) as RecordProxy<ActionMeeting_meeting>
    if (!meeting) return
    const phases = meeting.getLinkedRecords('phases')
    const agendaPhase = phases.find((phase) =>
      phase ? phase.getValue('phaseType') === 'agendaitems' : false
    )
    if (!agendaPhase) return
    const getSortOrder = (stage) => {
      const agendaItemId = stage.getValue('agendaItemId')
      const agendaItem = store.get<AgendaItem_agendaItem>(agendaItemId)
      if (!agendaItem) return 0
      return agendaItem.getValue('sortOrder')
    }
    const stages = agendaPhase.getLinkedRecords('stages')
    if (!stages) return
    stages.sort((a, b) => {
      return getSortOrder(a)! > getSortOrder(b)! ? 1 : -1
    })
    agendaPhase.setLinkedRecords(stages, 'stages')
  }
}

export const updateAgendaItemUpdater: SharedUpdater<UpdateAgendaItemMutation_team> = (
  payload,
  {store}
) => {
  const agendaItem = payload.getLinkedRecord('agendaItem')
  const meetingId = payload.getValue('meetingId')
  if (!agendaItem) return
  const teamId = agendaItem.getValue('teamId')
  handleUpdateAgendaItems(store, teamId)
  handleUpdateAgendaPhase(store, meetingId)
}

const UpdateAgendaItemMutation: StandardMutation<
  TUpdateAgendaItemMutation,
  {meetingId: string | undefined}
> = (atmosphere, variables, {meetingId}) => {
  const {updatedAgendaItem} = variables
  const [teamId] = updatedAgendaItem.id.split('::')
  return commitMutation<TUpdateAgendaItemMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('updateAgendaItem')
      if (!payload) return
      updateAgendaItemUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const proxyAgendaItem = store.get(updatedAgendaItem.id)
      updateProxyRecord(proxyAgendaItem, updatedAgendaItem)
      handleUpdateAgendaItems(store, teamId)
      handleUpdateAgendaPhase(store, meetingId)
    }
  })
}

export default UpdateAgendaItemMutation
