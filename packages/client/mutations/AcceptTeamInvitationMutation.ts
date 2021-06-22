import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {InvitationTokenError} from '~/types/constEnums'
import {AcceptTeamInvitationMutation_notification} from '~/__generated__/AcceptTeamInvitationMutation_notification.graphql'
import {
  HistoryMaybeLocalHandler,
  OnNextHandler,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import fromTeamMemberId from '../utils/relay/fromTeamMemberId'
import getGraphQLError from '../utils/relay/getGraphQLError'
import {AcceptTeamInvitationMutation as TAcceptTeamInvitationMutation} from '../__generated__/AcceptTeamInvitationMutation.graphql'
import {AcceptTeamInvitationMutation_team} from '../__generated__/AcceptTeamInvitationMutation_team.graphql'
import handleAddTeamMembers from './handlers/handleAddTeamMembers'
import handleAddTeams from './handlers/handleAddTeams'
import handleAuthenticationRedirect from './handlers/handleAuthenticationRedirect'

graphql`
  fragment AcceptTeamInvitationMutation_team on AcceptTeamInvitationPayload {
    teamMember {
      id
      isLead
      isNotRemoved
      picture
      preferredName
      teamId
      userId
      user {
        isConnected
      }
    }
    team {
      name
    }
  }
`
graphql`
  fragment AcceptTeamInvitationMutation_notification on AcceptTeamInvitationPayload {
    # this is just for the user that accepted the invitation
    team {
      ...DashNavListTeam
      ...TopBarMeetingsActiveMeetings
      id
      name
      isPaid
      activeMeetings {
        id
      }
    }
    # this is just for the team lead
    teamLead {
      suggestedActions {
        ...TimelineSuggestedAction_suggestedAction @relay(mask: false)
      }
    }
  }
`

graphql`
  fragment AcceptTeamInvitationMutationReply on AcceptTeamInvitationPayload {
    authToken
    error {
      message
    }
    meetingId
    team {
      id
      activeMeetings {
        id
      }
    }
  }
`

const mutation = graphql`
  mutation AcceptTeamInvitationMutation($invitationToken: ID!, $notificationId: ID) {
    acceptTeamInvitation(invitationToken: $invitationToken, notificationId: $notificationId) {
      ...AcceptTeamInvitationMutationReply @relay(mask: false)
      ...AcceptTeamInvitationMutation_notification @relay(mask: false)
    }
  }
`

export const acceptTeamInvitationNotificationUpdater: SharedUpdater<AcceptTeamInvitationMutation_notification> = (
  payload,
  {store}
) => {
  const team = payload.getLinkedRecord('team')
  if (!team) return
  handleAddTeams(team, store)

  // the viewer could have requested the meeting & had it return null
  const activeMeetings = team.getLinkedRecords('activeMeetings')
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (viewer) {
    activeMeetings.forEach((activeMeeting) => {
      const meetingId = activeMeeting.getValue('id')
      viewer.setLinkedRecord(activeMeeting, 'meeting', {meetingId})
    })
  }
}

export const acceptTeamInvitationTeamUpdater: SharedUpdater<AcceptTeamInvitationMutation_team> = (
  payload,
  {store}
) => {
  const teamMember = payload.getLinkedRecord('teamMember')
  handleAddTeamMembers(teamMember, store)
}

export const acceptTeamInvitationTeamOnNext: OnNextHandler<AcceptTeamInvitationMutation_team> = (
  payload,
  {atmosphere}
) => {
  const {team, teamMember} = payload
  if (!team || !teamMember) return
  const {name: teamName} = team
  const {id: teamMemberId, preferredName} = teamMember
  const {teamId, userId} = fromTeamMemberId(teamMemberId)
  atmosphere.eventEmitter.emit(
    'removeSnackbar',
    (snack) => snack.key === `pushInvitation:${teamId}:${userId}`
  )
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 5,
    key: `acceptTeamInvitation:${teamMemberId}`,
    message: `${preferredName} just joined team ${teamName}`
  })
}

interface LocalHandler extends HistoryMaybeLocalHandler {
  meetingId?: string | null
}

const AcceptTeamInvitationMutation: StandardMutation<
  TAcceptTeamInvitationMutation,
  LocalHandler
> = (
  atmosphere,
  variables,
  {history, onCompleted, onError, meetingId: locallyRequestedMeetingId}
) => {
    return commitMutation<TAcceptTeamInvitationMutation>(atmosphere, {
      mutation,
      variables,
      updater: (store) => {
        const payload = store.getRootField('acceptTeamInvitation')
        if (!payload) return
        acceptTeamInvitationNotificationUpdater(payload, {atmosphere, store})
      },
      onError,
      onCompleted: (data, errors) => {
        if (onCompleted) {
          onCompleted(data, errors)
        }
        const serverError = getGraphQLError(data, errors)
        if (serverError) {
          if (serverError.message === InvitationTokenError.ALREADY_ACCEPTED) {
            const {acceptTeamInvitation} = data
            handleAuthenticationRedirect(acceptTeamInvitation, {
              atmosphere,
              history,
              meetingId: locallyRequestedMeetingId
            })
          }
          return
        }
        const {acceptTeamInvitation} = data
        const {authToken, team} = acceptTeamInvitation
        atmosphere.setAuthToken(authToken)
        if (!team) return
        const {id: teamId, name: teamName} = team
        atmosphere.eventEmitter.emit('addSnackbar', {
          key: `addedToTeam:${teamId}`,
          autoDismiss: 5,
          message: `Congratulations! You’ve been added to team ${teamName}`
        })
        handleAuthenticationRedirect(acceptTeamInvitation, {
          atmosphere,
          history,
          meetingId: locallyRequestedMeetingId
        })
      }
    })
  }

export default AcceptTeamInvitationMutation
