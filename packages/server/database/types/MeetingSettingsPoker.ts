import MeetingSettings from './MeetingSettings'
import JiraSearchQuery from './JiraSearchQuery'
import {NewMeetingPhaseTypeEnum} from './GenericMeetingPhase'

interface Input {
  teamId: string
  id?: string
  maxVotesPerGroup?: number
  totalVotes?: number
  selectedTemplateId?: string
}

const phaseTypes = ['checkin', 'SCOPE', 'ESTIMATE'] as NewMeetingPhaseTypeEnum[]

export default class MeetingSettingsPoker extends MeetingSettings {
  selectedTemplateId: string
  jiraSearchQueries?: JiraSearchQuery[]
  constructor(input: Input) {
    const {teamId, id, selectedTemplateId} = input
    super({teamId, id, meetingType: 'poker', phaseTypes})
    this.selectedTemplateId = selectedTemplateId || 'estimatedEffortTemplate'
  }
}
