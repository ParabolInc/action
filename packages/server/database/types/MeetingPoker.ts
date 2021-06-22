import GenericMeetingPhase from './GenericMeetingPhase'
import Meeting from './Meeting'

interface Input {
  teamId: string
  meetingCount: number
  name?: string
  phases: GenericMeetingPhase[]
  facilitatorUserId: string
  templateId: string
  templateRefId: string
}

export default class MeetingPoker extends Meeting {
  templateId: string
  templateRefId: string
  storyCount?: number
  constructor(input: Input) {
    const {teamId, meetingCount, name, phases, facilitatorUserId, templateId, templateRefId} = input
    super({
      teamId,
      meetingCount,
      phases,
      facilitatorUserId,
      meetingType: 'poker',
      name: name ?? `Sprint Poker #${meetingCount + 1}`
    })
    this.templateId = templateId
    this.templateRefId = templateRefId
  }
}
