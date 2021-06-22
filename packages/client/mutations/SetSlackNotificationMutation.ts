import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import {LocalHandlers} from '../types/relayMutations'
import {
  SetSlackNotificationMutation as TSetSlackNotificationMutation,
  SetSlackNotificationMutationVariables
} from '../__generated__/SetSlackNotificationMutation.graphql'
import toTeamMemberId from '../utils/relay/toTeamMemberId'

graphql`
  fragment SetSlackNotificationMutation_team on SetSlackNotificationPayload {
    user {
      ...SlackProviderRow_viewer
      teamMember(teamId: $teamId) {
        integrations {
          slack {
            notifications {
              channelId
            }
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation SetSlackNotificationMutation(
    $slackNotificationEvents: [SlackNotificationEventEnum!]!
    $slackChannelId: ID
    $teamId: ID!
  ) {
    setSlackNotification(
      slackNotificationEvents: $slackNotificationEvents
      slackChannelId: $slackChannelId
      teamId: $teamId
    ) {
      error {
        message
      }
      ...SetSlackNotificationMutation_team @relay(mask: false)
    }
  }
`

const SetSlackNotificationMutation = (
  atmosphere,
  variables: SetSlackNotificationMutationVariables,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<TSetSlackNotificationMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {slackNotificationEvents, slackChannelId, teamId} = variables
      const {viewerId} = atmosphere
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const teamMember = store.get(teamMemberId)
      if (!teamMember) return
      const integrations = teamMember.getLinkedRecord('integrations')
      if (!integrations) return
      const slack = integrations.getLinkedRecord('slack')
      if (!slack) return
      const existingNotifications = slack.getLinkedRecords('notifications')
      if (!existingNotifications) return
      slackNotificationEvents.forEach((event) => {
        const existingNotification = existingNotifications.find(
          (notification) => !!(notification && notification.getValue('event') === event)
        )
        if (existingNotification) {
          existingNotification.setValue(slackChannelId, 'channelId')
        }
      })
    },
    onCompleted,
    onError
  })
}

export default SetSlackNotificationMutation
