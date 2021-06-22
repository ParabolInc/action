import {MeetingSettingsThreshold} from '~/types/constEnums'
import {NewMeetingPhaseTypeEnum} from './GenericMeetingPhase'
import MeetingSettings from './MeetingSettings'

interface Input {
  teamId: string
  id?: string
  maxVotesPerGroup?: number
  totalVotes?: number
  selectedTemplateId?: string
}

const phaseTypes = ['checkin', 'reflect', 'group', 'vote', 'discuss'] as NewMeetingPhaseTypeEnum[]

export default class MeetingSettingsRetrospective extends MeetingSettings {
  maxVotesPerGroup: number
  totalVotes: number
  selectedTemplateId: string
  constructor(input: Input) {
    const {teamId, id, maxVotesPerGroup, selectedTemplateId, totalVotes} = input
    super({teamId, id, meetingType: 'retrospective', phaseTypes})
    this.maxVotesPerGroup =
      maxVotesPerGroup ?? MeetingSettingsThreshold.RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT
    this.totalVotes = totalVotes ?? MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_DEFAULT
    this.selectedTemplateId = selectedTemplateId || 'workingStuckTemplate'
  }
}
