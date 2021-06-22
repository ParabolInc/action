import pluralizeHandler from './pluralizeHandler'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import {RecordSourceSelectorProxy} from 'relay-runtime'
import {AgendaItem_agendaItem} from '~/__generated__/AgendaItem_agendaItem.graphql'
import {ActionMeeting_meeting} from '~/__generated__/ActionMeeting_meeting.graphql'

const handleRemoveAgendaItem = (
  agendaItemId: string,
  store: RecordSourceSelectorProxy,
  meetingId?: string
) => {
  const agendaItem = store.get<AgendaItem_agendaItem>(agendaItemId)
  if (!agendaItem) return
  const teamId = agendaItem.getValue('id').split('::')[0]
  const team = store.get(teamId)
  safeRemoveNodeFromArray(agendaItemId, team, 'agendaItems')
  if (meetingId) {
    const meeting = store.get<ActionMeeting_meeting>(meetingId)
    if (!meeting) return
    const phases = meeting.getLinkedRecords('phases')
    if (!phases) return
    const agendaItemPhase = phases.find((phase) => phase.getValue('phaseType') === 'agendaitems')
    if (!agendaItemPhase) return
    const stages = agendaItemPhase.getLinkedRecords('stages')
    if (!stages) return
    const stageToRemove = stages.find((stage) => stage.getValue('agendaItemId') === agendaItemId)
    if (!stageToRemove) return
    const stageId = stageToRemove.getValue('id') as string
    if (!stageId) return
    safeRemoveNodeFromArray(stageId, agendaItemPhase, 'stages')
  }
}

const handleRemoveAgendaItems = pluralizeHandler(handleRemoveAgendaItem)
export default handleRemoveAgendaItems
