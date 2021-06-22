import graphql from 'babel-plugin-relay/macro'
/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 */
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useCallbackRef from '~/hooks/useCallbackRef'
import {RetroGroupPhase_meeting} from '~/__generated__/RetroGroupPhase_meeting.graphql'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import GroupingKanban from './GroupingKanban'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import {RetroMeetingPhaseProps} from './RetroMeeting'
import StageTimerDisplay from './StageTimerDisplay'

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroGroupPhase_meeting
}

const RetroGroupPhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting} = props
  const [callbackRef, phaseRef] = useCallbackRef()
  const {endedAt, showSidebar} = meeting

  return (
    <MeetingContent ref={callbackRef}>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.group}</PhaseHeaderTitle>
          <PhaseHeaderDescription>{'Drag cards to group by common topics'}</PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay meeting={meeting} canUndo={true} />
          <MeetingPhaseWrapper>
            <GroupingKanban meeting={meeting} phaseRef={phaseRef} />
          </MeetingPhaseWrapper>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

export default createFragmentContainer(RetroGroupPhase, {
  meeting: graphql`
    fragment RetroGroupPhase_meeting on RetrospectiveMeeting {
      ...StageTimerControl_meeting
      ...StageTimerDisplay_meeting
      ...GroupingKanban_meeting
      endedAt
      showSidebar
    }
  `
})
