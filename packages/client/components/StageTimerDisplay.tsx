import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {Breakpoint} from '~/types/constEnums'
import {StageTimerDisplay_meeting} from '~/__generated__/StageTimerDisplay_meeting.graphql'
import StageTimerDisplayGauge from './StageTimerDisplayGauge'
import PhaseCompleteTag from '~/components/Tag/PhaseCompleteTag'
import UndoableGroupPhaseControl from '~/components/UndoableGroupPhaseControl'
import useAtmosphere from '~/hooks/useAtmosphere'
import isDemoRoute from '~/utils/isDemoRoute'

interface Props {
  meeting: StageTimerDisplay_meeting
  canUndo?: boolean
}

const DisplayRow = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  [`@media screen and (min-height: 800px) and (min-width: ${Breakpoint.SINGLE_REFLECTION_COLUMN}px)`]: {
    // for larger viewports: dont' want stuff to move when it turns on
    // adding a min-height, we lose too much vertical real estate when the timer is not used
    // todo: float over top bar when there’s room @ laptop+ breakpoint
    minHeight: 44
  }
})

const PhaseCompleteWrapper = styled('div')({
  alignItems: 'flex-start',
  display: 'flex'
})

const StageTimerDisplay = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {meeting, canUndo} = props
  const {localPhase, localStage, facilitatorUserId} = meeting
  const {localScheduledEndTime, isComplete} = localStage
  const {stages, phaseType} = localPhase
  const isPhaseComplete = stages.every((stage) => stage.isComplete)
  const {viewerId} = atmosphere
  // scoping this to the group phase for a real retro
  const isDemo = isDemoRoute()
  const canUndoGroupPhase = !isDemo && canUndo && viewerId === facilitatorUserId && phaseType === 'group'
  return (
    <DisplayRow>
      {localScheduledEndTime && !isComplete ? (
        <StageTimerDisplayGauge endTime={localScheduledEndTime} />
      ) : null}
      {isPhaseComplete
        ? <PhaseCompleteWrapper>
          <PhaseCompleteTag isComplete={isPhaseComplete} />
          {canUndoGroupPhase ? <UndoableGroupPhaseControl meetingId={meeting.id} resetToStageId={localStage.id} /> : null}
        </PhaseCompleteWrapper>
        : null}
    </DisplayRow>
  )
}

graphql`
  fragment StageTimerDisplayStage on NewMeetingStage {
    id
    isComplete
    scheduledEndTime @__clientField(handle: "localTime")
    timeRemaining
    localScheduledEndTime
  }
`
export default createFragmentContainer(StageTimerDisplay, {
  meeting: graphql`
    fragment StageTimerDisplay_meeting on NewMeeting {
      facilitatorUserId
      id
      localPhase {
        phaseType
        stages {
          isComplete
        }
      }
      localStage {
        ...StageTimerDisplayStage @relay(mask: false)
      }
      phases {
        stages {
          ...StageTimerDisplayStage @relay(mask: false)
          isComplete
        }
      }
    }
  `
})
