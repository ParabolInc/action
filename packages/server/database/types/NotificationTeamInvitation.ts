import Notification from './Notification'

interface Input {
  invitationId: string
  teamId: string
  userId: string
}

export default class NotificationTeamInvitation extends Notification {
  invitationId: string
  teamId: string
  constructor(input: Input) {
    const {invitationId, teamId, userId} = input
    super({userId, type: 'TEAM_INVITATION'})
    this.invitationId = invitationId
    this.teamId = teamId
  }
}
