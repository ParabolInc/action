import graphQLSubscriptionType from '../graphQLSubscriptionType'
import AcceptTeamInvitationPayload from './AcceptTeamInvitationPayload'
import AddFeatureFlagPayload from './AddFeatureFlagPayload'
import AddNewFeaturePayload from './addNewFeaturePayload'
import AddOrgPayload from './AddOrgPayload'
import AddTeamPayload from './AddTeamPayload'
import {ArchiveTimelineEventSuccess} from './ArchiveTimelineEventPayload'
import AuthTokenPayload from './AuthTokenPayload'
import CreateTaskPayload from './CreateTaskPayload'
import DeleteTaskPayload from './DeleteTaskPayload'
import DisconnectSocketPayload from './DisconnectSocketPayload'
import EndNewMeetingPayload from './EndNewMeetingPayload'
import InvalidateSessionsPayload from './InvalidateSessionsPayload'
import InviteToTeamPayload from './InviteToTeamPayload'
import MeetingStageTimeLimitPayload from './MeetingStageTimeLimitPayload'
import RemoveOrgUserPayload from './RemoveOrgUserPayload'
import SetNotificationStatusPayload from './SetNotificationStatusPayload'
import StripeFailPaymentPayload from './StripeFailPaymentPayload'
import {PersistJiraSearchQuerySuccess} from './PersistJiraSearchQueryPayload'
import User from './User'
import {EndCheckInSuccess} from './EndCheckInPayload'
import {EndRetrospectiveSuccess} from './EndRetrospectivePayload'

const types = [
  AcceptTeamInvitationPayload,
  AddFeatureFlagPayload,
  AddNewFeaturePayload,
  AddOrgPayload,
  AddTeamPayload,
  ArchiveTimelineEventSuccess,
  SetNotificationStatusPayload,
  CreateTaskPayload,
  DeleteTaskPayload,
  DisconnectSocketPayload,
  EndCheckInSuccess,
  EndNewMeetingPayload,
  EndRetrospectiveSuccess,
  InvalidateSessionsPayload,
  InviteToTeamPayload,
  MeetingStageTimeLimitPayload,
  RemoveOrgUserPayload,
  StripeFailPaymentPayload,
  PersistJiraSearchQuerySuccess,
  // User doesn't have an error field, either make an exception & add it (because it's the Viewer) or use a payload here
  User,
  // a one off used so the server can sniff it & update its connection context
  AuthTokenPayload
]

export default graphQLSubscriptionType('NotificationSubscriptionPayload', types)
