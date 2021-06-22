import {ArchiveTeamMutation as TArchiveTeamMutation} from '../__generated__/ArchiveTeamMutation.graphql'
import {ArchiveTeamMutation_team} from '../__generated__/ArchiveTeamMutation_team.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import handleAddNotifications from './handlers/handleAddNotifications'
import onTeamRoute from '../utils/onTeamRoute'
import getInProxy from '../utils/relay/getInProxy'
import safeRemoveNodeFromArray from '../utils/relay/safeRemoveNodeFromArray'
import {
  HistoryLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'
import onMeetingRoute from '../utils/onMeetingRoute'
import SetNotificationStatusMutation from './SetNotificationStatusMutation'
import handleRemoveReflectTemplate from './handlers/handleRemoveReflectTemplate'

graphql`
  fragment ArchiveTeamMutation_team on ArchiveTeamPayload {
    notification {
      id
      type
      ...TeamArchived_notification
    }
    team {
      id
      name
      activeMeetings {
        id
      }
    }
    teamTemplateIds
  }
`

const mutation = graphql`
  mutation ArchiveTeamMutation($teamId: ID!) {
    archiveTeam(teamId: $teamId) {
      error {
        message
      }
      removedSuggestedActionIds
      ...ArchiveTeamMutation_team @relay(mask: false)
    }
  }
`

const popTeamArchivedToast: OnNextHandler<ArchiveTeamMutation_team, OnNextHistoryContext> = (
  payload,
  {history, atmosphere}
) => {
  if (!payload) return
  const {team, notification} = payload
  if (!team) return
  const {id: teamId, name: teamName, activeMeetings} = team
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `teamArchived:${teamId}`,
    autoDismiss: 5,
    message: `${teamName} has been archived.`,
    action: {
      label: 'OK',
      callback: () => {
        if (!notification) return
        const {id: notificationId} = notification
        // notification is not persisted for the mutator
        if (notificationId) {
          SetNotificationStatusMutation(
            atmosphere,
            {
              notificationId,
              status: 'CLICKED'
            },
            {}
          )
        }
      }
    }
  })
  const meetingIds = activeMeetings.map(({id}) => id)
  if (
    onTeamRoute(window.location.pathname, teamId) ||
    onMeetingRoute(window.location.pathname, meetingIds)
  ) {
    history && history.push('/me')
  }
}

export const archiveTeamTeamUpdater: SharedUpdater<ArchiveTeamMutation_team> = (
  payload,
  {store}
) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')!
  const teamId = getInProxy(payload, 'team', 'id')
  safeRemoveNodeFromArray(teamId, viewer, 'teams')

  const notification = payload.getLinkedRecord('notification')
  handleAddNotifications(notification, store)
}

export const archiveTeamTeamOnNext: OnNextHandler<
  ArchiveTeamMutation_team,
  OnNextHistoryContext
> = (payload, {atmosphere, history}) => {
  popTeamArchivedToast(payload, {atmosphere, history})
}

const ArchiveTeamMutation: StandardMutation<TArchiveTeamMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, history}
) => {
  return commitMutation<TArchiveTeamMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('archiveTeam')
      if (!payload) return
      const teamTemplateIds = payload.getValue('teamTemplateIds')
      const team = payload.getLinkedRecord('team')
      const teamId = team.getValue('id')
      teamTemplateIds?.forEach((templateId) => {
        handleRemoveReflectTemplate(templateId, teamId, store)
      })
      archiveTeamTeamUpdater(payload, {atmosphere, store})
      const removedSuggestedActionIds = payload.getValue('removedSuggestedActionIds')
      handleRemoveSuggestedActions(removedSuggestedActionIds, store)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      const payload = res.archiveTeam
      if (payload) {
        popTeamArchivedToast(payload, {atmosphere, history})
      }
    },
    onError
  })
}

export default ArchiveTeamMutation
