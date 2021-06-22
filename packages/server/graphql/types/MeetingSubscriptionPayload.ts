import graphQLSubscriptionType from '../graphQLSubscriptionType'
import {AddCommentSuccess} from './AddCommentPayload'
import {AddReactjiToReactableSuccess} from './AddReactjiToReactablePayload'
import {AddReactjiToReflectionSuccess} from './AddReactjiToReflectionPayload'
import AutoGroupReflectionsPayload from './AutoGroupReflectionsPayload'
import CreateReflectionPayload from './CreateReflectionPayload'
import {DeleteCommentSuccess} from './DeleteCommentPayload'
import DragDiscussionTopicPayload from './DragDiscussionTopicPayload'
import {DragEstimatingTaskSuccess} from './DragEstimatingTaskPayload'
import EditCommentingPayload from './EditCommentingPayload'
import EditReflectionPayload from './EditReflectionPayload'
import EndDraggingReflectionPayload from './EndDraggingReflectionPayload'
import {FlagReadyToAdvanceSuccess} from './FlagReadyToAdvancePayload'
import {GitHubCreateIssueSuccess} from './GitHubCreateIssuePayload'
import JiraCreateIssuePayload from './JiraCreateIssuePayload'
import {JoinMeetingSuccess} from './JoinMeetingPayload'
import NewMeetingCheckInPayload from './NewMeetingCheckInPayload'
import {PokerAnnounceDeckHoverSuccess} from './PokerAnnounceDeckHoverPayload'
import {PokerResetDimensionSuccess} from './PokerResetDimensionPayload'
import {PokerRevealVotesSuccess} from './PokerRevealVotesPayload'
import {PokerSetFinalScoreSuccess} from './PokerSetFinalScorePayload'
import PromoteNewMeetingFacilitatorPayload from './PromoteNewMeetingFacilitatorPayload'
import RemoveReflectionPayload from './RemoveReflectionPayload'
import ResetMeetingToStagePayload from './ResetMeetingToStagePayload'
import {SetAppLocationSuccess} from './SetAppLocationPayload'
import SetPhaseFocusPayload from './SetPhaseFocusPayload'
import {SetPokerSpectateSuccess} from './SetPokerSpectatePayload'
import SetStageTimerPayload from './SetStageTimerPayload'
import StartDraggingReflectionPayload from './StartDraggingReflectionPayload'
import {UpdateCommentContentSuccess} from './UpdateCommentContentPayload'
import UpdateDragLocationPayload from './UpdateDragLocationPayload'
import UpdateNewCheckInQuestionPayload from './UpdateNewCheckInQuestionPayload'
import {UpdatePokerScopeSuccess} from './UpdatePokerScopePayload'
import UpdateReflectionContentPayload from './UpdateReflectionContentPayload'
import UpdateReflectionGroupTitlePayload from './UpdateReflectionGroupTitlePayload'
import {UpdateRetroMaxVotesSuccess} from './UpdateRetroMaxVotesPayload'
import {VoteForPokerStorySuccess} from './VoteForPokerStoryPayload'
import VoteForReflectionGroupPayload from './VoteForReflectionGroupPayload'

const types = [
  // DEPRECATED
  AddCommentSuccess,
  AddReactjiToReflectionSuccess,
  AddReactjiToReactableSuccess,
  AutoGroupReflectionsPayload,
  CreateReflectionPayload,
  DeleteCommentSuccess,
  DragDiscussionTopicPayload,
  DragEstimatingTaskSuccess,
  EditCommentingPayload,
  EditReflectionPayload,
  EndDraggingReflectionPayload,
  FlagReadyToAdvanceSuccess,
  JiraCreateIssuePayload,
  NewMeetingCheckInPayload,
  PromoteNewMeetingFacilitatorPayload,
  RemoveReflectionPayload,
  ResetMeetingToStagePayload,
  SetAppLocationSuccess,
  SetPhaseFocusPayload,
  SetStageTimerPayload,
  StartDraggingReflectionPayload,
  UpdateCommentContentSuccess,
  UpdateDragLocationPayload,
  UpdateNewCheckInQuestionPayload,
  UpdateReflectionContentPayload,
  UpdateReflectionGroupTitlePayload,
  UpdateRetroMaxVotesSuccess,
  UpdatePokerScopeSuccess,
  VoteForReflectionGroupPayload,
  VoteForPokerStorySuccess,
  PokerRevealVotesSuccess,
  PokerResetDimensionSuccess,
  PokerAnnounceDeckHoverSuccess,
  PokerSetFinalScoreSuccess,
  JoinMeetingSuccess,
  GitHubCreateIssueSuccess,
  SetPokerSpectateSuccess
]

export default graphQLSubscriptionType('MeetingSubscriptionPayload', types)
