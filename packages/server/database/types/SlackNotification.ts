import generateUID from '../../generateUID'

export const slackNotificationEventTypeLookup = {
  meetingStart: 'team',
  meetingEnd: 'team',
  MEETING_STAGE_TIME_LIMIT_END: 'member',
  MEETING_STAGE_TIME_LIMIT_START: 'team'
} as const

export type SlackNotificationEvent = keyof typeof slackNotificationEventTypeLookup
export type SlackNotificationEventEnum =
  | 'MEETING_STAGE_TIME_LIMIT_END'
  | 'MEETING_STAGE_TIME_LIMIT_START'
  | 'meetingEnd'
  | 'meetingStart'

interface Input {
  event: SlackNotificationEvent
  channelId: string | null | undefined
  teamId: string
  userId: string
  id?: string
}

export default class SlackNotification {
  id: string
  event: SlackNotificationEvent
  channelId: string | null
  teamId: string
  userId: string

  constructor(input: Input) {
    const {event, channelId, teamId, userId, id} = input
    this.id = id || generateUID()
    this.event = event
    this.channelId = channelId || null
    this.teamId = teamId
    this.userId = userId
  }
}
