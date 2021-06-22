import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'

const resolveStage = (phaseType: NewMeetingPhaseTypeEnum) => async (
  {meetingId, stageId},
  _args,
  {dataLoader}
) => {
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {phases} = meeting
  const phase = phases.find((phase) => phase.phaseType === phaseType)!
  const {stages} = phase
  return stages.find((stage) => stage.id === stageId)!
}

export default resolveStage
