import {NewMeetingPhaseTypeEnum} from './GenericMeetingPhase'
import MeetingSettings from './MeetingSettings'
interface Input {
  teamId: string
  id?: string
}

const phaseTypes = [
  'checkin',
  'updates',
  'firstcall',
  'agendaitems',
  'lastcall'
] as NewMeetingPhaseTypeEnum[]
export default class MeetingSettingsAction extends MeetingSettings {
  constructor(input: Input) {
    const {teamId, id} = input
    super({teamId, id, meetingType: 'action', phaseTypes})
  }
}
