import {InviteToTeamMutation as TInviteToTeamMutation} from '../__generated__/InviteToTeamMutation.graphql'
import {InviteToTeamMutation_notification} from '../__generated__/InviteToTeamMutation_notification.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {matchPath} from 'react-router'
import handleAddNotifications from './handlers/handleAddNotifications'
import {OnNextHistoryContext, StandardMutation} from '../types/relayMutations'
import AcceptTeamInvitationMutation from './AcceptTeamInvitationMutation'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'

graphql`
  fragment InviteToTeamMutation_notification on InviteToTeamPayload {
    teamInvitationNotification {
      ...TeamInvitationNotification_notification
      id
      type
      team {
        id
        name
      }
      invitation {
        inviter {
          preferredName
        }
        token
      }
    }
  }
`

const mutation = graphql`
  mutation InviteToTeamMutation($meetingId: ID, $teamId: ID!, $invitees: [Email!]!) {
    inviteToTeam(meetingId: $meetingId, invitees: $invitees, teamId: $teamId) {
      error {
        message
      }
      invitees
      removedSuggestedActionId
      ...InviteToTeamMutation_notification @relay(mask: false)
    }
  }
`

const popInvitationReceivedToast = (
  notification: InviteToTeamMutation_notification['teamInvitationNotification'] | null,
  {atmosphere, history}: OnNextHistoryContext
) => {
  if (!notification) return
  const {
    id: notificationId,
    team: {name: teamName, id: teamId},
    invitation: {
      token: invitationToken,
      inviter: {preferredName: inviterName}
    }
  } = notification
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `inviteToTeam:${teamId}`,
    autoDismiss: 10,
    message: `${inviterName} has invited you to join their team ${teamName}`,
    action: {
      label: 'Accept!',
      callback: () => {
        AcceptTeamInvitationMutation(atmosphere, {invitationToken, notificationId}, {history})
      }
    }
  })
}

export const inviteToTeamNotificationUpdater = (payload, {store}) => {
  const teamInvitationNotification = payload.getLinkedRecord('teamInvitationNotification')
  handleAddNotifications(teamInvitationNotification, store)
}

export const inviteToTeamNotificationOnNext = (
  payload: InviteToTeamMutation_notification,
  {atmosphere, history}
) => {
  const {teamInvitationNotification} = payload
  if (!teamInvitationNotification) return
  const isWaiting = !!matchPath(window.location.pathname, {path: `/invitation-required`})
  if (isWaiting) {
    const search = new URLSearchParams(window.location.search)
    const meetingId = search.get('meetingId')
    const {id: notificationId, invitation} = teamInvitationNotification
    const {token: invitationToken} = invitation
    AcceptTeamInvitationMutation(
      atmosphere,
      {invitationToken, notificationId},
      {history, meetingId}
    )
  } else {
    popInvitationReceivedToast(teamInvitationNotification, {atmosphere, history})
  }
}

const InviteToTeamMutation: StandardMutation<TInviteToTeamMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TInviteToTeamMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('inviteToTeam')
      if (!payload) return
      const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
      handleRemoveSuggestedActions(removedSuggestedActionId, store)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
    },
    onError
  })
}

export default InviteToTeamMutation
