import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'

interface Input {
  isNotRemoved?: boolean
  isLead?: boolean
  hideAgenda?: boolean
  isSpectatingPoker?: boolean
  email: string
  picture: string
  preferredName: string
  teamId: string
  userId: string
  updatedAt?: Date
}

export default class TeamMember {
  id: string
  isNotRemoved: boolean
  isLead: boolean
  isSpectatingPoker: boolean
  hideAgenda: boolean
  email: string
  picture: string
  preferredName: string
  teamId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  constructor(input: Input) {
    const {
      teamId,
      email,
      hideAgenda,
      isLead,
      isNotRemoved,
      picture,
      preferredName,
      userId,
      isSpectatingPoker
    } = input
    this.id = toTeamMemberId(teamId, userId)
    this.teamId = teamId
    this.email = email
    this.hideAgenda = hideAgenda || false
    this.isLead = isLead || false
    this.isSpectatingPoker = isSpectatingPoker || false
    this.isNotRemoved = isNotRemoved === undefined ? true : isNotRemoved
    this.picture = picture
    this.preferredName = preferredName
    this.userId = userId
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}
