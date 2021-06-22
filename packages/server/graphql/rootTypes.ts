import ActionMeeting from './types/ActionMeeting'
import ActionMeetingMember from './types/ActionMeetingMember'
import ActionMeetingSettings from './types/ActionMeetingSettings'
import AgendaItemsPhase from './types/AgendaItemsPhase'
import AuthIdentityGoogle from './types/AuthIdentityGoogle'
import AuthIdentityLocal from './types/AuthIdentityLocal'
import CheckInPhase from './types/CheckInPhase'
import Comment from './types/Comment'
import DiscussPhase from './types/DiscussPhase'
import EstimatePhase from './types/EstimatePhase'
import GenericMeetingPhase from './types/GenericMeetingPhase'
import MeetingTemplate from './types/MeetingTemplate'
import NotificationTeamInvitation from './types/NotificationTeamInvitation'
import NotifyPromoteToOrgLeader from './types/NotifyPromoteToOrgLeader'
import PokerMeetingSettings from './types/PokerMeetingSettings'
import PokerTemplate from './types/PokerTemplate'
import ReflectPhase from './types/ReflectPhase'
import RetrospectiveMeeting from './types/RetrospectiveMeeting'
import RetrospectiveMeetingMember from './types/RetrospectiveMeetingMember'
import RetrospectiveMeetingSettings from './types/RetrospectiveMeetingSettings'
import SuggestedActionCreateNewTeam from './types/SuggestedActionCreateNewTeam'
import SuggestedActionInviteYourTeam from './types/SuggestedActionInviteYourTeam'
import SuggestedActionTryActionMeeting from './types/SuggestedActionTryActionMeeting'
import SuggestedActionTryRetroMeeting from './types/SuggestedActionTryRetroMeeting'
import SuggestedActionTryTheDemo from './types/SuggestedActionTryTheDemo'
import SuggestedIntegrationGitHub from './types/SuggestedIntegrationGitHub'
import SuggestedIntegrationJira from './types/SuggestedIntegrationJira'
import TaskIntegrationGitHub from './types/TaskIntegrationGitHub'
import TaskIntegrationJira from './types/TaskIntegrationJira'
import TimelineEventCompletedActionMeeting from './types/TimelineEventCompletedActionMeeting'
import TimelineEventCompletedRetroMeeting from './types/TimelineEventCompletedRetroMeeting'
import TimelineEventJoinedParabol from './types/TimelineEventJoinedParabol'
import TimelineEventPokerComplete from './types/TimelineEventPokerComplete'
import TimelineEventTeamCreated from './types/TimelineEventTeamCreated'
import UpdatesPhase from './types/UpdatesPhase'

const rootTypes = [
  AuthIdentityGoogle,
  AuthIdentityLocal,
  CheckInPhase,
  ReflectPhase,
  PokerTemplate,
  MeetingTemplate,
  DiscussPhase,
  UpdatesPhase,
  EstimatePhase,
  AgendaItemsPhase,
  GenericMeetingPhase,
  EstimatePhase,
  NotificationTeamInvitation,
  NotifyPromoteToOrgLeader,
  ActionMeeting,
  ActionMeetingMember,
  PokerMeetingSettings,
  RetrospectiveMeeting,
  RetrospectiveMeetingMember,
  RetrospectiveMeetingSettings,
  SuggestedActionInviteYourTeam,
  SuggestedActionTryRetroMeeting,
  SuggestedActionTryActionMeeting,
  SuggestedActionCreateNewTeam,
  SuggestedActionTryTheDemo,
  TimelineEventTeamCreated,
  TimelineEventJoinedParabol,
  TimelineEventCompletedRetroMeeting,
  TimelineEventCompletedActionMeeting,
  TimelineEventPokerComplete,
  ActionMeetingSettings,
  TaskIntegrationGitHub,
  TaskIntegrationJira,
  SuggestedIntegrationGitHub,
  SuggestedIntegrationJira,
  Comment
]
export default rootTypes
