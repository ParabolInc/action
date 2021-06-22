import Notification from './Notification'

interface Input {
  archivorUserId: string
  teamId: string
  userId: string
}

export default class NotificationTeamArchived extends Notification {
  archivorUserId: string
  teamId: string
  constructor(input: Input) {
    const {archivorUserId, teamId, userId} = input
    super({userId, type: 'TEAM_ARCHIVED'})
    this.archivorUserId = archivorUserId
    this.teamId = teamId
  }
}
