import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {NewMeetingCheckInPrompt_meeting} from '~/__generated__/NewMeetingCheckInPrompt_meeting.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import defaultUserAvatar from '../../../../styles/theme/images/avatar-user.svg'
import {Breakpoint} from '../../../../types/constEnums'
import {NewMeetingCheckInPrompt_teamMember} from '../../../../__generated__/NewMeetingCheckInPrompt_teamMember.graphql'
import NewMeetingCheckInGreeting from '../NewMeetingCheckInGreeting'
import NewCheckInQuestion from './NewCheckInQuestion'

const PromptBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '37.5rem',
  padding: '0 1.25rem'
})

const AvatarBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  paddingBottom: 16
})

const CheckInBlock = styled('div')({
  width: '100%'
})

interface Props {
  meeting: NewMeetingCheckInPrompt_meeting
  teamMember: NewMeetingCheckInPrompt_teamMember
}

const NewMeetingCheckinPrompt = (props: Props) => {
  const {meeting, teamMember} = props
  const isLargeViewport = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {picture} = teamMember
  const {localPhase} = meeting
  const {checkInGreeting} = localPhase
  const size = isLargeViewport ? 160 : 128
  return (
    <PromptBlock>
      <AvatarBlock>
        <Avatar picture={picture || defaultUserAvatar} size={size} />
      </AvatarBlock>
      <CheckInBlock>
        <NewMeetingCheckInGreeting checkInGreeting={checkInGreeting!} teamMember={teamMember} />
        <NewCheckInQuestion meeting={meeting} />
      </CheckInBlock>
    </PromptBlock>
  )
}

export default createFragmentContainer(NewMeetingCheckinPrompt, {
  meeting: graphql`
    fragment NewMeetingCheckInPrompt_meeting on NewMeeting {
      ...NewCheckInQuestion_meeting
      localPhase {
        phaseType
        id
        ... on CheckInPhase {
          checkInGreeting {
            ...NewMeetingCheckInGreeting_checkInGreeting
          }
        }
      }
      # request question from server to use locally (above)
      phases {
        ... on CheckInPhase {
          checkInGreeting {
            ...NewMeetingCheckInGreeting_checkInGreeting
          }
        }
      }
    }
  `,
  teamMember: graphql`
    fragment NewMeetingCheckInPrompt_teamMember on TeamMember {
      ...NewMeetingCheckInGreeting_teamMember
      picture
    }
  `
})
