import {r} from 'rethinkdb-ts'
import Organization from '../database/types/Organization'
import SlackAuth from '../database/types/SlackAuth'
import SlackNotification from '../database/types/SlackNotification'
import TeamInvitation from '../database/types/TeamInvitation'
import TeamMember from '../database/types/TeamMember'
import getRethinkConfig from './getRethinkConfig'
import {R} from './stricterR'
import ActionMeetingMember from './types/ActionMeetingMember'
import AgendaItem from './types/AgendaItem'
import AtlassianAuth from './types/AtlassianAuth'
import Comment from './types/Comment'
import FailedAuthRequest from './types/FailedAuthRequest'
import Invoice from './types/Invoice'
import InvoiceItemHook from './types/InvoiceItemHook'
import MassInvitation from './types/MassInvitation'
import MeetingAction from './types/MeetingAction'
import MeetingPoker from './types/MeetingPoker'
import MeetingRetrospective from './types/MeetingRetrospective'
import MeetingSettingsAction from './types/MeetingSettingsAction'
import MeetingSettingsPoker from './types/MeetingSettingsPoker'
import MeetingSettingsRetrospective from './types/MeetingSettingsRetrospective'
import MeetingTemplate from './types/MeetingTemplate'
import NotificationKickedOut from './types/NotificationKickedOut'
import NotificationMeetingStageTimeLimitEnd from './types/NotificationMeetingStageTimeLimitEnd'
import NotificationPaymentRejected from './types/NotificationPaymentRejected'
import NotificationPromoteToBillingLeader from './types/NotificationPromoteToBillingLeader'
import NotificationTaskInvolves from './types/NotificationTaskInvolves'
import NotificationTeamArchived from './types/NotificationTeamArchived'
import NotificationTeamInvitation from './types/NotificationTeamInvitation'
import OrganizationUser from './types/OrganizationUser'
import PasswordResetRequest from './types/PasswordResetRequest'
import PokerMeetingMember from './types/PokerMeetingMember'
import PushInvitation from './types/PushInvitation'
import Reflection from './types/Reflection'
import ReflectionGroup from './types/ReflectionGroup'
import RetroMeetingMember from './types/RetroMeetingMember'
import RetrospectivePrompt from './types/RetrospectivePrompt'
import SAML from './types/SAML'
import ScheduledJob from './types/ScheduledJob'
import SuggestedActionCreateNewTeam from './types/SuggestedActionCreateNewTeam'
import SuggestedActionInviteYourTeam from './types/SuggestedActionInviteYourTeam'
import SuggestedActionTryTheDemo from './types/SuggestedActionTryTheDemo'
import Task from './types/Task'
import Team from './types/Team'
import TemplateDimension from './types/TemplateDimension'
import TemplateScale from './types/TemplateScale'
import TimelineEvent from './types/TimelineEvent'
import User from './types/User'

export type RethinkSchema = {
  AgendaItem: {
    type: AgendaItem
    index: 'teamId' | 'meetingId'
  }
  AtlassianAuth: {
    type: AtlassianAuth
    index: 'atlassianUserId' | 'userId' | 'teamId'
  }
  Comment: {
    type: Comment
    index: 'threadId'
  }
  ReflectPrompt: {
    type: RetrospectivePrompt
    index: 'teamId' | 'templateId'
  }
  EmailVerification: {
    type: any
    index: 'email' | 'token'
  }
  FailedAuthRequest: {
    type: FailedAuthRequest
    index: 'email' | 'ip'
  }
  GQLRequest: {
    type: any
    index: 'id'
  }
  Invoice: {
    type: Invoice
    index: 'orgIdStartAt'
  }
  InvoiceItemHook: {
    type: InvoiceItemHook
    index: 'prorationDate' | 'stripeSubscriptionId'
  }
  MassInvitation: {
    type: MassInvitation
    index: 'teamMemberId'
  }
  MeetingSettings: {
    type: MeetingSettingsRetrospective | MeetingSettingsAction | MeetingSettingsPoker
    index: 'teamId'
  }
  MeetingMember: {
    type: PokerMeetingMember | RetroMeetingMember | ActionMeetingMember
    index: 'meetingId' | 'teamId' | 'userId'
  }
  NewMeeting: {
    type: MeetingRetrospective | MeetingAction | MeetingPoker
    index: 'facilitatorUserId' | 'teamId' | 'templateId'
  }
  NewFeature: {
    type: any
    index: ''
  }
  Notification: {
    type:
      | NotificationTaskInvolves
      | NotificationTeamArchived
      | NotificationMeetingStageTimeLimitEnd
      | NotificationPaymentRejected
      | NotificationKickedOut
      | NotificationPromoteToBillingLeader
      | NotificationTeamInvitation
    index: 'userId'
  }
  Organization: {
    type: Organization
    index: 'tier' | 'activeDomain'
  }
  OrganizationUser: {
    type: OrganizationUser
    index: 'orgId' | 'userId'
  }
  PasswordResetRequest: {
    type: PasswordResetRequest
    index: 'email' | 'ip' | 'token'
  }
  PushInvitation: {
    type: PushInvitation
    index: 'userId'
  }
  QueryMap: {
    type: any
    index: ''
  }
  MeetingTemplate: {
    type: MeetingTemplate
    index: 'teamId' | 'orgId'
  }
  RetroReflectionGroup: {
    type: ReflectionGroup
    index: 'meetingId'
  }
  RetroReflection: {
    type: Reflection
    index: 'meetingId' | 'reflectionGroupId'
  }
  SAML: {
    type: SAML
    index: 'domains'
  }
  ScheduledJob: {
    type: ScheduledJob
    index: 'runAt' | 'type'
  }
  SecureDomain: {
    type: any
    index: 'domain'
  }
  SlackAuth: {
    type: SlackAuth
    index: 'teamId' | 'userId'
  }
  SlackNotification: {
    type: SlackNotification
    index: 'teamId' | 'userId'
  }
  SuggestedAction: {
    // tryRetroMeeting = 'tryRetroMeeting',
    // tryActionMeeting = 'tryActionMeeting'
    type: SuggestedActionCreateNewTeam | SuggestedActionInviteYourTeam | SuggestedActionTryTheDemo
    index: 'userId'
  }
  Task: {
    type: Task
    index: 'integrationId' | 'tags' | 'teamId' | 'teamIdUpdatedAt' | 'threadId' | 'userId'
  }
  TaskHistory: {
    type: any
    index: 'taskIdUpdatedAt' | 'teamMemberId'
  }
  Team: {
    type: Team
    index: 'orgId'
  }
  TeamInvitation: {
    type: TeamInvitation
    index: 'email' | 'teamId' | 'token'
  }
  TeamMember: {
    type: TeamMember
    index: 'teamId' | 'userId'
  }
  TemplateDimension: {
    type: TemplateDimension
    index: 'teamId' | 'templateId'
  }
  TemplateScale: {
    type: TemplateScale
    index: 'teamId'
  }
  TimelineEvent: {
    type: TimelineEvent
    index: 'userIdCreatedAt' | 'meetingId'
  }
  User: {
    type: User
    index: 'email'
  }
}

export type DBType = {
  [P in keyof RethinkSchema]: RethinkSchema[P]['type']
}

type ParabolR = R<RethinkSchema>
const config = getRethinkConfig()
let isLoading = false
let isLoaded = false
let promise
const getRethink = async () => {
  if (!isLoaded) {
    if (!isLoading) {
      isLoading = true
      promise = r.connectPool(config)
    }
    await promise
    isLoaded = true
  }
  // this is important because pm2 will restart the process & for whatever reason r isn't always healthy
  await r.waitForHealthy()
  return (r as unknown) as ParabolR
}

export default getRethink
