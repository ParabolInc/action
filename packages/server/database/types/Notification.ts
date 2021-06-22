import generateUID from '../../generateUID'

export type NotificationEnum =
  | 'KICKED_OUT'
  | 'MEETING_STAGE_TIME_LIMIT_END'
  | 'PAYMENT_REJECTED'
  | 'PROMOTE_TO_BILLING_LEADER'
  | 'TASK_INVOLVES'
  | 'TEAM_ARCHIVED'
  | 'TEAM_INVITATION'
export interface NotificationInput {
  type: NotificationEnum
  userId: string
}

export default abstract class Notification {
  id = generateUID()
  status = 'UNREAD'
  createdAt = new Date()
  type: NotificationEnum
  userId: string

  constructor({type, userId}: NotificationInput) {
    this.type = type
    this.userId = userId
  }
}
