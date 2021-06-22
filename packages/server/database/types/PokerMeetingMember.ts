import MeetingMember from './MeetingMember'

interface Input {
  id?: string
  updatedAt?: Date
  teamId: string
  userId: string
  meetingId: string
  isSpectating: boolean
}

export default class PokerMeetingMember extends MeetingMember {
  isSpectating: boolean
  constructor(input: Input) {
    const {isSpectating} = input
    super({...input, meetingType: 'poker'})
    this.isSpectating = isSpectating
  }
}
