import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useCallbackRef from '~/hooks/useCallbackRef'
import {RetroReflectPhase_meeting} from '~/__generated__/RetroReflectPhase_meeting.graphql'
import useBreakpoint from '../../hooks/useBreakpoint'
import {Breakpoint} from '../../types/constEnums'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import MeetingContent from '../MeetingContent'
import MeetingHeaderAndPhase from '../MeetingHeaderAndPhase'
import MeetingTopBar from '../MeetingTopBar'
import PhaseHeaderDescription from '../PhaseHeaderDescription'
import PhaseHeaderTitle from '../PhaseHeaderTitle'
import PhaseWrapper from '../PhaseWrapper'
import {RetroMeetingPhaseProps} from '../RetroMeeting'
import StageTimerDisplay from '../StageTimerDisplay'
import PhaseItemColumn from './PhaseItemColumn'
import ReflectWrapperMobile from './ReflectionWrapperMobile'
import ReflectWrapperDesktop from './ReflectWrapperDesktop'

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroReflectPhase_meeting
}

const RetroReflectPhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting} = props
  const [callbackRef, phaseRef] = useCallbackRef()
  const [activeIdx, setActiveIdx] = useState(0)
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const {localPhase, endedAt, showSidebar} = meeting
  if (!localPhase || !localPhase.reflectPrompts) return null
  const reflectPrompts = localPhase!.reflectPrompts
  const focusedPromptId = localPhase!.focusedPromptId
  const ColumnWrapper = isDesktop ? ReflectWrapperDesktop : ReflectWrapperMobile
  return (
    <MeetingContent ref={callbackRef}>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.reflect}</PhaseHeaderTitle>
          <PhaseHeaderDescription>
            {'Add anonymous reflections for each prompt'}
          </PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay meeting={meeting} />
          <ColumnWrapper
            setActiveIdx={setActiveIdx}
            activeIdx={activeIdx}
            focusedIdx={reflectPrompts.findIndex(({id}) => id === focusedPromptId)}
          >
            {reflectPrompts.map((prompt, idx) => (
              <PhaseItemColumn
                key={prompt.id}
                meeting={meeting}
                prompt={prompt}
                idx={idx}
                phaseRef={phaseRef}
                isDesktop={isDesktop}
              />
            ))}
          </ColumnWrapper>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

graphql`
  fragment RetroReflectPhase_phase on ReflectPhase {
    focusedPromptId
    reflectPrompts {
      ...PhaseItemColumn_prompt
      id
      sortOrder
    }
  }
`

export default createFragmentContainer(RetroReflectPhase, {
  meeting: graphql`
    fragment RetroReflectPhase_meeting on RetrospectiveMeeting {
      ...StageTimerDisplay_meeting
      ...StageTimerControl_meeting
      ...PhaseItemColumn_meeting
      endedAt
      localPhase {
        ...RetroReflectPhase_phase @relay(mask: false)
      }
      localStage {
        isComplete
      }
      phases {
        ...RetroReflectPhase_phase @relay(mask: false)
      }
      showSidebar
    }
  `
})
