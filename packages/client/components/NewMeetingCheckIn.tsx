import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement} from 'react'
import {createFragmentContainer} from 'react-relay'
import {NewMeetingCheckIn_meeting} from '~/__generated__/NewMeetingCheckIn_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import NewMeetingCheckInPrompt from '../modules/meeting/components/MeetingCheckInPrompt/NewMeetingCheckInPrompt'
import MeetingFacilitationHint from '../modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import Icon from './Icon'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import useGotoStageId from '~/hooks/useGotoStageId'

const CheckIn = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  minHeight: 98,
  padding: 16,
  width: '100%'
})

const Hint = styled('div')({
  marginTop: 16
})

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  display: 'block',
  margin: '0 auto 4px',
  width: ICON_SIZE.MD24
})

interface Props {
  avatarGroup: ReactElement
  meeting: NewMeetingCheckIn_meeting
  toggleSidebar: () => void
  gotoStageId?: ReturnType<typeof useGotoStageId>
}

const NewMeetingCheckIn = (props: Props) => {
  const {avatarGroup, meeting, toggleSidebar} = props
  const atmosphere = useAtmosphere()
  const {endedAt, showSidebar, localStage, phases} = meeting
  const {id: localStageId} = localStage
  const teamMember = localStage.teamMember!
  const {userId} = teamMember
  const nextStageRes = findStageAfterId(phases, localStageId)
  // in case the checkin is the last phase of the meeting
  if (!nextStageRes) return null
  const {viewerId} = atmosphere
  const isMyMeetingSection = userId === viewerId
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.checkin}</PhaseHeaderTitle>
        </MeetingTopBar>
        <PhaseWrapper>
          <NewMeetingCheckInPrompt meeting={meeting} teamMember={teamMember} />
          <CheckIn>
            {isMyMeetingSection && (
              <Hint>
                <StyledIcon>record_voice_over</StyledIcon>
                <MeetingFacilitationHint>
                  {'Verbally share your response with the team'}
                </MeetingFacilitationHint>
              </Hint>
            )}
          </CheckIn>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

graphql`
  fragment NewMeetingCheckInLocalStage on CheckInStage {
    teamMember {
      userId
      ...NewMeetingCheckInPrompt_teamMember
    }
  }
`

export default createFragmentContainer(NewMeetingCheckIn, {
  meeting: graphql`
    fragment NewMeetingCheckIn_meeting on NewMeeting {
      ...NewMeetingCheckInPrompt_meeting
      endedAt
      showSidebar
      facilitatorStageId
      localStage {
        id
        ...NewMeetingCheckInLocalStage @relay(mask: false)
      }
      phases {
        stages {
          id
          ...NewMeetingCheckInLocalStage @relay(mask: false)
        }
      }
      teamId
    }
  `
})
