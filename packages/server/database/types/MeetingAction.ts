import GenericMeetingPhase from './GenericMeetingPhase'
import Meeting from './Meeting'

interface Input {
  teamId: string
  meetingCount: number
  name?: string
  phases: GenericMeetingPhase[]
  facilitatorUserId: string
}

export default class MeetingAction extends Meeting {
  taskCount?: number
  commentCount?: number
  agendaItemCount?: number
  constructor(input: Input) {
    const {teamId, meetingCount, name, phases, facilitatorUserId} = input
    super({
      teamId,
      meetingCount,
      phases,
      facilitatorUserId,
      meetingType: 'action',
      name: name ?? `Check-in #${meetingCount + 1}`
    })
  }
}
