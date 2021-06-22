import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ActionMeetingAgendaItems_meeting} from '~/__generated__/ActionMeetingAgendaItems_meeting.graphql'
import useBreakpoint from '~/hooks/useBreakpoint'

import styled from '@emotion/styled'

import EditorHelpModalContainer from '../containers/EditorHelpModalContainer/EditorHelpModalContainer'
import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import {Breakpoint} from '../types/constEnums'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import {ActionMeetingPhaseProps} from './ActionMeeting'
import Avatar from './Avatar/Avatar'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'

interface Props extends ActionMeetingPhaseProps {
  meeting: ActionMeetingAgendaItems_meeting
}

const AgendaVerbatim = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '0 auto'
})

const StyledHeading = styled(MeetingPhaseHeading)({
  marginLeft: 16,
  fontSize: 24
})

const StyledCopy = styled(MeetingCopy)({
  margin: '16px 0 0'
})

const ThreadColumn = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  paddingTop: 4,
  paddingBottom: isDesktop ? 16 : 8,
  width: '100%',
  maxWidth: 700
}))

const ActionMeetingAgendaItems = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting} = props
  const {showSidebar, id: meetingId, endedAt, localStage} = meeting
  const {agendaItem, agendaItemId} = localStage
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const meetingContentRef = useRef<HTMLDivElement>(null)
  // optimistic updater could remove the agenda item
  if (!agendaItem) return null
  const {content, teamMember} = agendaItem
  const {picture, preferredName} = teamMember
  return (
    <MeetingContent ref={meetingContentRef}>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.agendaitems}</PhaseHeaderTitle>
        </MeetingTopBar>
        <PhaseWrapper>
          <AgendaVerbatim>
            <Avatar picture={picture} size={64} />
            <StyledHeading>{content}</StyledHeading>
          </AgendaVerbatim>
          <StyledCopy>{`${preferredName}, what do you need?`}</StyledCopy>
          <ThreadColumn isDesktop={isDesktop}>
            <DiscussionThreadRoot
              meetingContentRef={meetingContentRef}
              meetingId={meetingId}
              threadSourceId={agendaItemId!}
            />
          </ThreadColumn>
          <EditorHelpModalContainer />
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

graphql`
  fragment ActionMeetingAgendaItemsStage on AgendaItemsStage {
    agendaItemId
    agendaItem {
      content
      teamMember {
        picture
        preferredName
      }
    }
  }
`

export default createFragmentContainer(ActionMeetingAgendaItems, {
  meeting: graphql`
    fragment ActionMeetingAgendaItems_meeting on ActionMeeting {
      id
      showSidebar
      endedAt
      facilitatorUserId
      phases {
        stages {
          ...ActionMeetingAgendaItemsStage @relay(mask: false)
        }
      }
      localStage {
        ...ActionMeetingAgendaItemsStage @relay(mask: false)
      }
    }
  `
})
