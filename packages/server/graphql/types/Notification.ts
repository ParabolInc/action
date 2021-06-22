import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import NotificationEnum from './NotificationEnum'
import NotificationMeetingStageTimeLimitEnd from './NotificationMeetingStageTimeLimitEnd'
import NotificationStatusEnum from './NotificationStatusEnum'
import NotificationTeamInvitation from './NotificationTeamInvitation'
import NotifyKickedOut from './NotifyKickedOut'
import NotifyPaymentRejected from './NotifyPaymentRejected'
import NotifyPromoteToOrgLeader from './NotifyPromoteToOrgLeader'
import NotifyTaskInvolves from './NotifyTaskInvolves'
import NotifyTeamArchived from './NotifyTeamArchived'
import PageInfoDateCursor from './PageInfoDateCursor'

export const notificationInterfaceFields = {
  id: {
    type: GraphQLNonNull(GraphQLID),
    description: 'A shortid for the notification'
  },
  status: {
    type: GraphQLNonNull(NotificationStatusEnum),
    description: 'UNREAD if new, READ if viewer has seen it, CLICKED if viewed clicked it'
  },
  // orgId: {
  //   type: GraphQLID,
  //   description:
  //     '*The unique organization ID for this notification. Can be blank for targeted notifications'
  // },
  createdAt: {
    type: GraphQLNonNull(GraphQLISO8601Type),
    description: 'The datetime to activate the notification & send it to the client'
  },
  type: {
    type: GraphQLNonNull(NotificationEnum)
  },
  userId: {
    type: GraphQLNonNull(GraphQLID),
    description: '*The userId that should see this notification'
  }
}

const Notification = new GraphQLInterfaceType({
  name: 'Notification',
  fields: () => notificationInterfaceFields,
  resolveType(value) {
    // type lookup needs to be resolved in a thunk since there is a circular reference when loading
    // alternative to treating it like a DB driver if GCing is an issue
    const resolveTypeLookup = {
      KICKED_OUT: NotifyKickedOut,
      PAYMENT_REJECTED: NotifyPaymentRejected,
      TASK_INVOLVES: NotifyTaskInvolves,
      PROMOTE_TO_BILLING_LEADER: NotifyPromoteToOrgLeader,
      TEAM_ARCHIVED: NotifyTeamArchived,
      TEAM_INVITATION: NotificationTeamInvitation,
      MEETING_STAGE_TIME_LIMIT_END: NotificationMeetingStageTimeLimitEnd
    } as const

    return resolveTypeLookup[value.type]
  }
})

const {connectionType, edgeType} = connectionDefinitions({
  nodeType: Notification,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    }
  })
})

export const NotificationConnection = connectionType
export const NotificationEdge = edgeType
export default Notification
