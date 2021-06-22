import generateUID from '../../generateUID'

export type TimelineEventEnum =
  | 'POKER_COMPLETE'
  | 'actionComplete'
  | 'createdTeam'
  | 'joinedParabol'
  | 'retroComplete'
interface Input {
  id?: string
  createdAt?: Date
  interactionCount?: number
  seenCount?: number
  type: TimelineEventEnum
  userId: string
  isActive?: boolean
}

export default abstract class TimelineEvent {
  id: string
  createdAt: Date
  interactionCount: number
  seenCount: number
  type: TimelineEventEnum
  userId: string
  isActive: boolean
  protected constructor(input: Input) {
    const {createdAt, id, userId, type, interactionCount, seenCount, isActive} = input
    this.id = id || generateUID()
    this.createdAt = createdAt || new Date()
    this.userId = userId
    this.type = type
    this.interactionCount = interactionCount || 0
    this.seenCount = seenCount || 0
    this.isActive = isActive ?? true
  }
}
