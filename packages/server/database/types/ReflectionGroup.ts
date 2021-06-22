import generateUID from '../../generateUID'

export interface ReflectionGroupInput {
  id?: string
  createdAt?: Date
  meetingId: string
  promptId: string
  sortOrder?: number
  updatedAt?: Date
  voterIds?: string[]
  title?: string
  smartTitle?: string
}

export default class ReflectionGroup {
  id: string
  createdAt: Date
  isActive: boolean
  meetingId: string
  promptId: string
  sortOrder: number
  updatedAt: Date
  voterIds: string[]
  title: string | null
  smartTitle: string | null
  constructor(input: ReflectionGroupInput) {
    const {
      createdAt,
      id,
      meetingId,
      promptId,
      sortOrder,
      updatedAt,
      voterIds,
      smartTitle,
      title
    } = input
    const now = new Date()
    this.id = id || generateUID()
    this.createdAt = createdAt || now
    this.isActive = true
    this.meetingId = meetingId
    this.promptId = promptId
    this.sortOrder = sortOrder || 0
    this.updatedAt = updatedAt || now
    this.voterIds = voterIds || []
    this.smartTitle = smartTitle || null
    this.title = title || null
  }
}
