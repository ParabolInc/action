import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import toTeamMemberId from '~/utils/relay/toTeamMemberId'
import {StandardMutation} from '../types/relayMutations'
import {SetDefaultSlackChannelMutation as TSetDefaultSlackChannelMutation} from '../__generated__/SetDefaultSlackChannelMutation.graphql'

graphql`
  fragment SetDefaultSlackChannelMutation_team on SetDefaultSlackChannelSuccess {
    teamMember {
      integrations {
        slack {
          notifications {
            channelId
          }
        }
      }
    }
    slackChannelId
  }
`

const mutation = graphql`
  mutation SetDefaultSlackChannelMutation($slackChannelId: ID!, $teamId: ID!) {
    setDefaultSlackChannel(slackChannelId: $slackChannelId, teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...SetDefaultSlackChannelMutation_team @relay(mask: false)
    }
  }
`

const SetDefaultSlackChannelMutation: StandardMutation<TSetDefaultSlackChannelMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetDefaultSlackChannelMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('setDefaultSlackChannel')
      if (!payload) return
      const teamMember = payload.getLinkedRecord('teamMember')
      if (!teamMember) return
      const slackChannelId = payload.getValue('slackChannelId')
      const integrations = teamMember.getLinkedRecord('integrations')
      if (!integrations) return
      const slack = integrations.getLinkedRecord('slack')
      if (!slack) return
      slack.setValue(slackChannelId, 'defaultTeamChannelId')
    },
    optimisticUpdater: (store) => {
      const {slackChannelId, teamId} = variables
      const {viewerId} = atmosphere
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const teamMember = store.get(teamMemberId)
      if (!teamMember) return
      const integrations = teamMember.getLinkedRecord('integrations')
      if (!integrations) return
      const slack = integrations.getLinkedRecord('slack')
      if (!slack) return
      slack.setValue(slackChannelId, 'defaultTeamChannelId')
    },
    onCompleted,
    onError
  })
}

export default SetDefaultSlackChannelMutation
