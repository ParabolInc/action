import graphql from 'babel-plugin-relay/macro'
import {RouterProps} from 'react-router'
import {requestSubscription, Variables} from 'relay-runtime'
import {endCheckInTeamOnNext, endCheckInTeamUpdater} from '~/mutations/EndCheckInMutation'
import {
  endRetrospectiveTeamOnNext,
  endRetrospectiveTeamUpdater
} from '~/mutations/EndRetrospectiveMutation'
import {navigateMeetingTeamUpdater} from '~/mutations/NavigateMeetingMutation'
import Atmosphere from '../Atmosphere'
import {
  acceptTeamInvitationTeamOnNext,
  acceptTeamInvitationTeamUpdater
} from '../mutations/AcceptTeamInvitationMutation'
import {addAgendaItemUpdater} from '../mutations/AddAgendaItemMutation'
import {addReflectTemplateTeamUpdater} from '../mutations/AddReflectTemplateMutation'
import {addReflectTemplatePromptTeamUpdater} from '../mutations/AddReflectTemplatePromptMutation'
import {addTeamTeamUpdater} from '../mutations/AddTeamMutation'
import {archiveTeamTeamOnNext, archiveTeamTeamUpdater} from '../mutations/ArchiveTeamMutation'
import {denyPushInvitationTeamOnNext} from '../mutations/DenyPushInvitationMutation'
import {
  endSprintPokerTeamOnNext,
  endSprintPokerTeamUpdater
} from '../mutations/EndSprintPokerMutation'
import {moveReflectTemplatePromptTeamUpdater} from '../mutations/MoveReflectTemplatePromptMutation'
import {pushInvitationTeamOnNext} from '../mutations/PushInvitationMutation'
import {removeAgendaItemUpdater} from '../mutations/RemoveAgendaItemMutation'
import {removeOrgUserTeamOnNext, removeOrgUserTeamUpdater} from '../mutations/RemoveOrgUserMutation'
import {removeReflectTemplateTeamUpdater} from '../mutations/RemoveReflectTemplateMutation'
import {removeReflectTemplatePromptTeamUpdater} from '../mutations/RemoveReflectTemplatePromptMutation'
import {
  removeTeamMemberTeamOnNext,
  removeTeamMemberTeamUpdater
} from '../mutations/RemoveTeamMemberMutation'
import {updateAgendaItemUpdater} from '../mutations/UpdateAgendaItemMutation'
import {TeamSubscriptionResponse} from '../__generated__/TeamSubscription.graphql'

const subscription = graphql`
  subscription TeamSubscription {
    teamSubscription {
      __typename
      ...MovePokerTemplateScaleValueMutation_team @relay(mask: false)
      ...UpdateJiraDimensionFieldMutation_team @relay(mask: false)
      ...AcceptTeamInvitationMutation_team @relay(mask: false)
      ...AddAgendaItemMutation_team @relay(mask: false)
      ...AddAtlassianAuthMutation_team @relay(mask: false)
      ...AddReflectTemplateMutation_team @relay(mask: false)
      ...AddReflectTemplatePromptMutation_team @relay(mask: false)
      ...AddTeamMutation_team @relay(mask: false)
      ...ArchiveTeamMutation_team @relay(mask: false)
      ...DenyPushInvitationMutation_team @relay(mask: false)
      ...EndCheckInMutation_team @relay(mask: false)
      ...EndRetrospectiveMutation_team @relay(mask: false)
      ...EndSprintPokerMutation_team @relay(mask: false)
      ...MoveReflectTemplatePromptMutation_team @relay(mask: false)
      ...NavigateMeetingMutation_team @relay(mask: false)
      ...PromoteToTeamLeadMutation_team @relay(mask: false)
      ...PushInvitationMutation_team @relay(mask: false)
      ...ReflectTemplatePromptUpdateGroupColorMutation_team @relay(mask: false)
      ...RemoveAgendaItemMutation_team @relay(mask: false)
      ...RemoveOrgUserMutation_team @relay(mask: false)
      ...RemoveReflectTemplateMutation_team @relay(mask: false)
      ...RemoveReflectTemplatePromptMutation_team @relay(mask: false)
      ...RemoveTeamMemberMutation_team @relay(mask: false)
      ...RenameMeetingMutation_team @relay(mask: false)
      ...RenameMeetingTemplateMutation_meetingTemplate @relay(mask: false)
      ...RenameReflectTemplatePromptMutation_team @relay(mask: false)
      ...SelectTemplateMutation_team @relay(mask: false)
      ...SetCheckInEnabledMutation_team @relay(mask: false)
      ...StartCheckInMutation_team @relay(mask: false)
      ...StartRetrospectiveMutation_team @relay(mask: false)
      ...StartSprintPokerMutation_team @relay(mask: false)
      ...UpdateAgendaItemMutation_team @relay(mask: false)
      ...UpdateCreditCardMutation_team @relay(mask: false)
      ...UpdateTeamNameMutation_team @relay(mask: false)
      ...UpdateUserProfileMutation_team @relay(mask: false)
      ...UpgradeToProMutation_team @relay(mask: false)
    }
  }
`

const onNextHandlers = {
  AcceptTeamInvitationPayload: acceptTeamInvitationTeamOnNext,
  ArchiveTeamPayload: archiveTeamTeamOnNext,
  DenyPushInvitationPayload: denyPushInvitationTeamOnNext,
  EndCheckInSuccess: endCheckInTeamOnNext,
  EndRetrospectiveSuccess: endRetrospectiveTeamOnNext,
  EndSprintPokerSuccess: endSprintPokerTeamOnNext,
  RemoveOrgUserPayload: removeOrgUserTeamOnNext,
  RemoveTeamMemberPayload: removeTeamMemberTeamOnNext,
  PushInvitationPayload: pushInvitationTeamOnNext
}

const updateHandlers = {
  AddAgendaItemPayload: addAgendaItemUpdater,
  RemoveAgendaItemPayload: removeAgendaItemUpdater,
  UpdateAgendaItemPayload: updateAgendaItemUpdater,
  AcceptTeamInvitationPayload: acceptTeamInvitationTeamUpdater,
  AddReflectTemplatePayload: addReflectTemplateTeamUpdater,
  AddReflectTemplatePromptPayload: addReflectTemplatePromptTeamUpdater,
  AddTeamMutationPayload: addTeamTeamUpdater,
  ArchiveTeamPayload: archiveTeamTeamUpdater,
  EndCheckInSuccess: endCheckInTeamUpdater,
  EndRetrospectiveSuccess: endRetrospectiveTeamUpdater,
  EndSprintPokerSuccess: endSprintPokerTeamUpdater,
  MoveReflectTemplatePromptPayload: moveReflectTemplatePromptTeamUpdater,
  NavigateMeetingPayload: navigateMeetingTeamUpdater,
  RemoveOrgUserPayload: removeOrgUserTeamUpdater,
  RemoveReflectTemplatePayload: removeReflectTemplateTeamUpdater,
  RemoveReflectTemplatePromptPayload: removeReflectTemplatePromptTeamUpdater,
  RemoveTeamMemberPayload: removeTeamMemberTeamUpdater
}

const TeamSubscription = (
  atmosphere: Atmosphere,
  variables: Variables,
  router: {history: RouterProps['history']}
) => {
  return requestSubscription<TeamSubscriptionResponse>(atmosphere, {
    subscription,
    variables,
    updater: (store) => {
      const payload = store.getRootField('teamSubscription') as any
      if (!payload) return
      const type = payload.getValue('__typename') as string
      const handler = updateHandlers[type]
      if (handler) {
        handler(payload, {atmosphere, store})
      }
    },
    onNext: (result) => {
      if (!result) return
      const {teamSubscription} = result
      const {__typename: type} = teamSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(teamSubscription, {...router, atmosphere})
      }
    },
    onCompleted: () => {
      atmosphere.unregisterSub(TeamSubscription.name, variables)
    }
  })
}
TeamSubscription.key = 'team'
export default TeamSubscription
