import {MeetingTypeEnum} from './Meeting'
import generateUID from '../../generateUID'
import {NewMeetingPhaseTypeEnum} from './GenericMeetingPhase'

interface Input {
  id?: string
  phaseTypes: NewMeetingPhaseTypeEnum[]
  meetingType: MeetingTypeEnum
  teamId: string
}

export default abstract class MeetingSettings {
  id: string
  phaseTypes: NewMeetingPhaseTypeEnum[]
  meetingType: MeetingTypeEnum
  teamId: string

  constructor(input: Input) {
    const {id, meetingType, phaseTypes, teamId} = input
    this.id = id ?? generateUID()
    this.meetingType = meetingType
    this.teamId = teamId
    this.phaseTypes = phaseTypes
  }
}
