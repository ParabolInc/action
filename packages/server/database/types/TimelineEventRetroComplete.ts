import TimelineEvent from './TimelineEvent'

interface Input {
  id?: string
  createdAt?: Date
  interactionCount?: number
  seenCount?: number
  userId: string
  teamId: string
  orgId: string
  meetingId: string
}
export default class TimelineEventRetroComplete extends TimelineEvent {
  teamId: string
  meetingId: string
  orgId: string
  constructor(input: Input) {
    super({...input, type: 'retroComplete'})
    const {teamId, orgId, meetingId} = input
    this.teamId = teamId
    this.orgId = orgId
    this.meetingId = meetingId
  }
}
