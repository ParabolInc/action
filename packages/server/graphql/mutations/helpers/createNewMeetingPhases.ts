import {
  AGENDA_ITEMS,
  CHECKIN,
  DISCUSS,
  FIRST_CALL,
  GROUP,
  LAST_CALL,
  REFLECT,
  UPDATES,
  VOTE
} from 'parabol-client/utils/constants'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import AgendaItemsPhase from '../../../database/types/AgendaItemsPhase'
import CheckInPhase from '../../../database/types/CheckInPhase'
import CheckInStage from '../../../database/types/CheckInStage'
import DiscussPhase from '../../../database/types/DiscussPhase'
import EstimatePhase from '../../../database/types/EstimatePhase'
import GenericMeetingPhase from '../../../database/types/GenericMeetingPhase'
import {MeetingTypeEnum} from '../../../database/types/Meeting'
import MeetingSettingsRetrospective from '../../../database/types/MeetingSettingsRetrospective'
import ReflectPhase from '../../../database/types/ReflectPhase'
import UpdatesPhase from '../../../database/types/UpdatesPhase'
import UpdatesStage from '../../../database/types/UpdatesStage'
import {DataLoaderWorker} from '../../graphql'

export const primePhases = (phases: GenericMeetingPhase[], startIndex = 0) => {
  const [firstPhase, secondPhase] = [phases[startIndex], phases[startIndex + 1]]
  firstPhase.stages[0].startAt = new Date()
  firstPhase.stages.forEach((stage) => {
    stage.isNavigable = true
    stage.isNavigableByFacilitator = true
  })
  const phaseTwoStageOne = secondPhase.stages[0]
  if (phaseTwoStageOne) {
    phaseTwoStageOne.isNavigableByFacilitator = true
  }
}

const getPastStageDurations = async (teamId: string) => {
  const r = await getRethink()
  return (
    (r
      .table('NewMeeting')
      .getAll(teamId, {index: 'teamId'})
      .filter({isLegacy: false}, {default: true})
      // .orderBy(r.desc('endedAt'))
      .concatMap((row) => row('phases'))
      .concatMap((row) => row('stages'))
      .filter((row) => row.hasFields('startAt', 'endAt'))
      // convert seconds to ms
      .merge((row) => ({
        duration: r
          .sub(row('endAt'), row('startAt'))
          .mul(1000)
          .floor()
      }))
      // remove stages that took under 1 minute
      .filter((row) => row('duration').ge(60000))
      .orderBy(r.desc('startAt'))
      .group('phaseType')
      .ungroup()
      .map((row) => [row('group'), row('reduction')('duration')])
      .coerceTo('object')
      .run() as unknown) as {[key: string]: number[]}
  )
}

const createNewMeetingPhases = async (
  facilitatorUserId: string,
  teamId: string,
  meetingCount: number,
  meetingType: MeetingTypeEnum,
  dataLoader: DataLoaderWorker
) => {
  const r = await getRethink()
  const now = new Date()
  const [meetingSettings, stageDurations] = await Promise.all([
    dataLoader.get('meetingSettingsByType').load({teamId, meetingType}),
    getPastStageDurations(teamId)
  ])
  const {phaseTypes} = meetingSettings
  const facilitatorTeamMemberId = toTeamMemberId(teamId, facilitatorUserId)
  const phases = (await Promise.all(
    phaseTypes.map(async (phaseType) => {
      const durations = stageDurations[phaseType]
      switch (phaseType) {
        case CHECKIN:
          return new CheckInPhase({
            teamId,
            meetingCount,
            stages: [new CheckInStage(facilitatorTeamMemberId)]
          })
        case REFLECT:
          const {selectedTemplateId} = meetingSettings as MeetingSettingsRetrospective
          await r
            .table('MeetingTemplate')
            .get(selectedTemplateId)
            .update({
              lastUsedAt: now
            })
            .run()
          return new ReflectPhase(teamId, selectedTemplateId, durations)
        case DISCUSS:
          return new DiscussPhase(durations)
        case UPDATES:
          return new UpdatesPhase({durations, stages: [new UpdatesStage(facilitatorTeamMemberId)]})
        case AGENDA_ITEMS:
          const agendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
          const agendaItemIds = agendaItems.map(({id}) => id)
          return new AgendaItemsPhase(agendaItemIds, durations)
        case 'ESTIMATE':
          return new EstimatePhase()
        case GROUP:
        case VOTE:
        case FIRST_CALL:
        case LAST_CALL:
        case 'SCOPE':
          return new GenericMeetingPhase(phaseType, durations)
        default:
          throw new Error(`Unhandled phaseType: ${phaseType}`)
      }
    })
  )) as GenericMeetingPhase[]
  primePhases(phases)
  return phases
}

export default createNewMeetingPhases
