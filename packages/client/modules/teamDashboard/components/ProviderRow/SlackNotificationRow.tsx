import React from 'react'
import styled from '@emotion/styled'
import Toggle from '../../../../components/Toggle/Toggle'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {
  SlackNotificationRow_viewer,
  SlackNotificationEventEnum
} from '../../../../__generated__/SlackNotificationRow_viewer.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import SetSlackNotificationMutation from '../../../../mutations/SetSlackNotificationMutation'
import StyledError from '../../../../components/StyledError'
import {MeetingLabels} from '../../../../types/constEnums'

interface Props {
  event: SlackNotificationEventEnum
  localChannelId: string | null
  viewer: SlackNotificationRow_viewer
  teamId: string
}

const labelLookup = {
  meetingEnd: 'Meeting End',
  meetingStart: 'Meeting Start',
  MEETING_STAGE_TIME_LIMIT_END: `Meeting ${MeetingLabels.TIME_LIMIT} Ended`,
  MEETING_STAGE_TIME_LIMIT_START: `Meeting ${MeetingLabels.TIME_LIMIT} Started`
} as Record<SlackNotificationEventEnum, string>

const Row = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: '8px 0'
})

const Label = styled('span')({
  fontSize: 14,
  marginRight: 16,
  width: '100%'
})

const SlackNotificationRow = (props: Props) => {
  const {event, localChannelId, teamId, viewer} = props
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {slack} = integrations
  const notifications = slack?.notifications ?? []
  const label = labelLookup[event]
  const atmosphere = useAtmosphere()
  const existingNotification = notifications.find((notification) => notification.event === event)
  const active = !!(existingNotification && existingNotification.channelId)
  const {error, submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const onClick = () => {
    if (submitting) return
    submitMutation()
    const slackChannelId = active ? null : localChannelId
    SetSlackNotificationMutation(
      atmosphere,
      {slackChannelId, slackNotificationEvents: [event as any], teamId},
      {
        onError,
        onCompleted
      }
    )
  }

  // does not show disabled when submitting because the temporary disabled mouse icon is ugly
  return (
    <>
      <Row>
        <Label>{label}</Label>
        <Toggle active={active} disabled={!localChannelId} onClick={onClick} />
      </Row>
      {error && <StyledError>{error.message}</StyledError>}
    </>
  )
}

export default createFragmentContainer(SlackNotificationRow, {
  viewer: graphql`
    fragment SlackNotificationRow_viewer on User {
      teamMember(teamId: $teamId) {
        integrations {
          slack {
            notifications {
              channelId
              event
            }
          }
        }
      }
    }
  `
})
