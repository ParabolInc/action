import generateUID from '../../generateUID'
import getIsMassInviteToken from '../../graphql/mutations/helpers/getIsMassInviteToken'

interface Input {
  id?: string
  acceptedAt?: Date
  acceptedBy?: string
  expiresAt: Date
  email: string
  invitedBy: string
  meetingId?: string
  teamId: string
  token: string
}
export default class TeamInvitation {
  id: string
  acceptedAt: Date | null
  acceptedBy?: string
  createdAt: Date
  expiresAt: Date
  email: string
  invitedBy: string
  isMassInvite: boolean
  meetingId?: string
  teamId: string
  token: string
  constructor(input: Input) {
    const {
      teamId,
      acceptedAt,
      acceptedBy,
      email,
      expiresAt,
      id,
      invitedBy,
      meetingId,
      token
    } = input
    this.id = id || generateUID()
    this.acceptedAt = acceptedAt || null
    this.acceptedBy = acceptedBy
    this.createdAt = new Date()
    this.expiresAt = expiresAt
    this.email = email
    this.invitedBy = invitedBy
    this.isMassInvite = getIsMassInviteToken(token)
    this.meetingId = meetingId
    this.teamId = teamId
    this.token = token
  }
}
