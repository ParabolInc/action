import TimelineEvent from './TimelineEvent'

interface Input {
  id?: string
  createdAt?: Date
  interactionCount?: number
  seenCount?: number
  userId: string
}
export default class TimelineEventJoinedParabol extends TimelineEvent {
  constructor(input: Input) {
    super({...input, type: 'joinedParabol'})
  }
}
