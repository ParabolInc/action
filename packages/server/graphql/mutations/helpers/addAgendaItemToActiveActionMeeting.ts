import {AGENDA_ITEMS} from 'parabol-client/utils/constants'
import getRethink from '../../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql'
import AgendaItemsPhase from '../../../database/types/AgendaItemsPhase'
import AgendaItemsStage from '../../../database/types/AgendaItemsStage'

/*
 * NewMeetings have a predefined set of stages, we need to add the new agenda item manually
 */
const addAgendaItemToActiveActionMeeting = async (
  agendaItemId,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const now = new Date()
  const r = await getRethink()
  const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  const actionMeeting = activeMeetings.find(
    (activeMeeting) => activeMeeting.meetingType === 'action'
  )
  if (!actionMeeting) return undefined
  const {id: meetingId, phases} = actionMeeting
  const agendaItemPhase = phases.find((phase) => phase.phaseType === AGENDA_ITEMS) as
    | AgendaItemsPhase
    | undefined
  if (!agendaItemPhase) return undefined

  const {stages} = agendaItemPhase
  const newStage = new AgendaItemsStage(agendaItemId)
  newStage.isNavigable = true
  newStage.isNavigableByFacilitator = true
  stages.push(newStage)

  await Promise.all([
    r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        phases,
        updatedAt: now
      })
      .run(),
    r
      .table('AgendaItem')
      .get(agendaItemId)
      .update({meetingId: meetingId})
      .run()
  ])

  return meetingId
}

export default addAgendaItemToActiveActionMeeting
