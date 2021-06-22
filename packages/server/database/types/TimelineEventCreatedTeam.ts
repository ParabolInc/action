import TimelineEvent from './TimelineEvent'

interface Input {
  id?: string
  createdAt?: Date
  interactionCount?: number
  seenCount?: number
  userId: string
  teamId: string
  orgId: string
}
export default class TimelineEventCreatedTeam extends TimelineEvent {
  teamId: string
  orgId: string
  constructor(input: Input) {
    super({...input, type: 'createdTeam'})
    const {teamId, orgId} = input
    this.teamId = teamId
    this.orgId = orgId
  }
}
