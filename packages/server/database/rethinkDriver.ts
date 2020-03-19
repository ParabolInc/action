import {
  IAgendaItem,
  IAtlassianAuth,
  IAzureDevopsAuth,
  INewFeatureBroadcast
} from 'parabol-client/types/graphql'
import {r} from 'rethinkdb-ts'
import MeetingMember from '../database/types/MeetingMember'
import Organization from '../database/types/Organization'
import SlackAuth from '../database/types/SlackAuth'
import SlackNotification from '../database/types/SlackNotification'
import TeamInvitation from '../database/types/TeamInvitation'
import TeamMember from '../database/types/TeamMember'
import getRethinkConfig from './getRethinkConfig'
import {R} from './stricterR'
import FailedAuthRequest from './types/FailedAuthRequest'
import Invoice from './types/Invoice'
import InvoiceItemHook from './types/InvoiceItemHook'
import MassInvitation from './types/MassInvitation'
import MeetingAction from './types/MeetingAction'
import MeetingRetrospective from './types/MeetingRetrospective'
import MeetingSettingsAction from './types/MeetingSettingsAction'
import MeetingSettingsRetrospective from './types/MeetingSettingsRetrospective'
import NotificationMeetingStageTimeLimitEnd from './types/NotificationMeetingStageTimeLimitEnd'
import NotificationPaymentRejected from './types/NotificationPaymentRejected'
import NotificationTaskInvolves from './types/NotificationTaskInvolves'
import NotificationTeamArchived from './types/NotificationTeamArchived'
import OrganizationUser from './types/OrganizationUser'
import PasswordResetRequest from './types/PasswordResetRequest'
import PushInvitation from './types/PushInvitation'
import Reflection from './types/Reflection'
import ReflectionGroup from './types/ReflectionGroup'
import ReflectTemplate from './types/ReflectTemplate'
import RetrospectivePrompt from './types/RetrospectivePrompt'
import SAML from './types/SAML'
import ScheduledJob from './types/ScheduledJob'
import SuggestedActionCreateNewTeam from './types/SuggestedActionCreateNewTeam'
import SuggestedActionInviteYourTeam from './types/SuggestedActionInviteYourTeam'
import SuggestedActionTryTheDemo from './types/SuggestedActionTryTheDemo'
import Task from './types/Task'
import Team from './types/Team'
import TimelineEvent from './types/TimelineEvent'
import User from './types/User'
import NotificationKickedOut from './types/NotificationKickedOut'
import NotificationPromoteToBillingLeader from './types/NotificationPromoteToBillingLeader'
import NotificationTeamInvitation from './types/NotificationTeamInvitation'
import Comment from './types/Comment'

export type RethinkTypes = {
  AgendaItem: {
    type: IAgendaItem
    index: 'teamId'
  }
  AtlassianAuth: {
    type: IAtlassianAuth
    index: 'atlassianUserId' | 'userId' | 'teamId'
  }
  AzureDevopsAuth: {
    type: IAzureDevopsAuth
    index: 'azureDevopsUserId' | 'userId' | 'teamId'
  }
  Comment: {
    type: Comment
    index: 'threadId'
  }
  CustomPhaseItem: {
    type: RetrospectivePrompt
    index: 'teamId'
  }
  EmailVerification: {
    type: any
    index: 'email' | 'token'
  }
  FailedAuthRequest: {
    type: FailedAuthRequest
    index: 'email' | 'ip'
  }
  Invoice: {
    type: Invoice
    index: 'orgIdStartAt'
  }
  InvoiceItemHook: {
    type: InvoiceItemHook
    index: 'prorationDate' | 'userId'
  }
  MassInvitation: {
    type: MassInvitation
    index: 'teamMemberId'
  }
  MeetingSettings: {
    type: MeetingSettingsRetrospective | MeetingSettingsAction
    index: 'teamId'
  }
  MeetingMember: {
    type: MeetingMember
    index: 'meetingId' | 'teamId' | 'userId'
  }
  NewMeeting: {
    type: MeetingRetrospective | MeetingAction
    index: 'facilitatorUserId' | 'teamId'
  }
  NewFeature: {
    type: INewFeatureBroadcast
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
    index: 'tier'
  }
  OrganizationUser: {
    type: OrganizationUser
    index: 'orgId' | 'userId'
  }
  PasswordResetRequest: {
    type: PasswordResetRequest
    index: 'email' | 'ip' | 'token'
  }
  Provider: {
    type: any
    index: 'providerUserId' | 'teamId'
  }
  PushInvitation: {
    type: PushInvitation
    index: 'userId'
  }
  QueryMap: {
    type: any
    index: ''
  }
  ReflectTemplate: {
    type: ReflectTemplate
    index: 'teamId'
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
    index: 'domain'
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
  TimelineEvent: {
    type: TimelineEvent
    index: 'userIdCreatedAt'
  }
  User: {
    type: User
    index: 'email'
  }
}

type ParabolR = R<RethinkTypes>

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
  return (r as unknown) as ParabolR
}

export default getRethink
