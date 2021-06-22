import generateUID from '../../generateUID'

interface Input {
  botUserId: string
  botAccessToken: string
  defaultTeamChannelId: string
  teamId: string
  userId: string
  slackTeamId: string
  slackTeamName: string
  slackUserId: string
  slackUserName: string
  id?: string
  createdAt?: Date
}

export default class SlackAuth {
  isActive = true
  updatedAt = new Date()
  id: string
  botUserId: string
  botAccessToken: string | null
  createdAt: Date
  defaultTeamChannelId: string
  teamId: string
  userId: string
  slackTeamId: string
  slackTeamName: string
  slackUserId: string
  slackUserName: string

  constructor(input: Input) {
    const {
      botUserId,
      botAccessToken,
      defaultTeamChannelId,
      teamId,
      userId,
      slackTeamId,
      slackTeamName,
      slackUserId,
      slackUserName,
      id,
      createdAt
    } = input
    this.id = id || generateUID()
    this.createdAt = createdAt || new Date()
    this.botUserId = botUserId
    this.botAccessToken = botAccessToken
    this.defaultTeamChannelId = defaultTeamChannelId
    this.teamId = teamId
    this.userId = userId
    this.slackTeamId = slackTeamId
    this.slackTeamName = slackTeamName
    this.slackUserId = slackUserId
    this.slackUserName = slackUserName
  }
}
