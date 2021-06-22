import {RecordSourceSelectorProxy} from 'relay-runtime'

const handleUpdateStageSort = (store: RecordSourceSelectorProxy, meetingId: string, phaseType: string) => {
  const meeting = store.get(meetingId)
  if (!meeting) return
  const phases = meeting.getLinkedRecords('phases')!
  const phase = phases.find((phase) => phase.getValue('phaseType') === phaseType)!
  const stages = phase.getLinkedRecords('stages')!
  stages.sort((a, b) => {
    return a.getValue('sortOrder')! > b.getValue('sortOrder')! ? 1 : -1
  })
  phase.setLinkedRecords(stages, 'stages')
}

export default handleUpdateStageSort
