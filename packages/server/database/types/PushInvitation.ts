import generateUID from '../../generateUID'

interface Input {
  id?: string
  userId: string
  teamId: string
  denialCount?: number
  lastDenialAt?: Date
}

export default class PushInvitation {
  id: string
  userId: string
  teamId: string
  denialCount: number
  lastDenialAt?: Date

  constructor(input: Input) {
    const {id, userId, teamId, denialCount, lastDenialAt} = input
    this.id = id || generateUID()
    this.userId = userId
    this.teamId = teamId
    this.denialCount = denialCount || 0
    this.lastDenialAt = lastDenialAt || undefined
  }
}
