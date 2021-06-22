import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useGotoNext from '~/hooks/useGotoNext'
import {TransitionStatus} from '~/hooks/useTransition'
import FlagReadyToAdvanceMutation from '~/mutations/FlagReadyToAdvanceMutation'
import {PALETTE} from '~/styles/paletteV3'
import {BezierCurve, Times} from '~/types/constEnums'
import {NewMeetingPhaseTypeEnum} from '../__generated__/BottomControlBarReady_meeting.graphql'
import handleRightArrow from '~/utils/handleRightArrow'
import {BottomControlBarReady_meeting} from '~/__generated__/BottomControlBarReady_meeting.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import BottomControlBarProgress from './BottomControlBarProgress'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import Icon from './Icon'

interface Props {
  isNext: boolean
  cancelConfirm: undefined | (() => void)
  isConfirming: boolean
  setConfirmingButton: (button: string) => void
  isDemoStageComplete?: boolean
  meeting: BottomControlBarReady_meeting
  status: TransitionStatus
  onTransitionEnd: () => void
  handleGotoNext: ReturnType<typeof useGotoNext>
}

const CheckIcon = styled(Icon)<{progress: number; isNext: boolean; isViewerReady: boolean}>(
  ({isViewerReady, progress, isNext}) => ({
    color: isNext ? PALETTE.ROSE_500 : isViewerReady ? PALETTE.JADE_400 : PALETTE.SLATE_600,
    fontSize: 24,
    fontWeight: 600,
    height: 24,
    opacity: isNext ? 1 : isViewerReady ? 1 : 0.5,
    transformOrigin: '0 0',
    // 20px to 16 = 0.75
    transform: progress > 0 ? `scale(0.75)translate(4px, 4px)` : undefined,
    transition: `transform 100ms ${BezierCurve.DECELERATE}`
  })
)

const PHASE_REQUIRES_CONFIRM = new Set<NewMeetingPhaseTypeEnum>(['reflect', 'group', 'vote'])

const BottomControlBarReady = (props: Props) => {
  const {
    cancelConfirm,
    isConfirming,
    isNext,
    setConfirmingButton,
    handleGotoNext,
    meeting,
    onTransitionEnd,
    status
  } = props
  const {id: meetingId, localPhase, localStage, meetingMembers, reflectionGroups} = meeting
  const stages = localPhase.stages || []
  const {id: stageId, isComplete, isViewerReady, phaseType} = localStage
  const {gotoNext, ref} = handleGotoNext
  const activeCount = meetingMembers.length
  const {openTooltip, tooltipPortal, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER,
    {
      disabled: !isConfirming,
      delay: Times.MEETING_CONFIRM_TOOLTIP_DELAY
    }
  )
  const atmosphere = useAtmosphere()
  const readyCount = localStage.readyCount || 0
  const progress = readyCount / Math.max(1, activeCount - 1)
  const isLastStageInPhase = stages[stages.length - 1]?.id === localStage?.id
  const isConfirmRequired =
    isLastStageInPhase &&
    PHASE_REQUIRES_CONFIRM.has(phaseType!) &&
    readyCount < activeCount - 1 &&
    activeCount > 1

  const onClick = () => {
    if (!isNext) {
      FlagReadyToAdvanceMutation(atmosphere, {isReady: !isViewerReady, meetingId, stageId})
    } else if (isComplete || !isConfirmRequired || isConfirming) {
      setConfirmingButton('')
      gotoNext()
    } else {
      setConfirmingButton('next')
      // let the above flush so isConfirming is set before opejning
      setTimeout(openTooltip)
    }
  }
  const onKeyDown = isNext
    ? handleRightArrow(() => {
      gotoNext()
    })
    : undefined
  const icon = isNext ? 'arrow_forward' : 'check'
  const label = isNext ? 'Next' : 'Ready'
  const getDisabled = () => {
    if (!isNext) return false
    if (phaseType === 'reflect') {
      return reflectionGroups?.length === 0 ?? true
    }
    return false
  }
  const disabled = getDisabled()
  return (
    <>
      <BottomNavControl
        dataCy={`next-phase`}
        disabled={disabled}
        confirming={!!cancelConfirm}
        onClick={cancelConfirm || onClick}
        status={status}
        onTransitionEnd={onTransitionEnd}
        onKeyDown={onKeyDown}
        ref={ref}
      >
        <BottomControlBarProgress isNext={isNext} progress={progress} />
        <BottomNavIconLabel label={label} ref={originRef}>
          <CheckIcon isViewerReady={isViewerReady} isNext={isNext} progress={progress}>
            {icon}
          </CheckIcon>
        </BottomNavIconLabel>
      </BottomNavControl>
      {tooltipPortal(`Tap 'Next' again to Confirm`)}
    </>
  )
}

graphql`
  fragment BottomControlBarReadyStage on NewMeetingStage {
    id
    isComplete
    readyCount
    isViewerReady
    phaseType
  }
`

export default createFragmentContainer(BottomControlBarReady, {
  meeting: graphql`
    fragment BottomControlBarReady_meeting on NewMeeting {
      ... on RetrospectiveMeeting {
        reflectionGroups {
          id
        }
      }
      id
      localStage {
        ...BottomControlBarReadyStage @relay(mask: false)
      }
      localPhase {
        stages {
          ...BottomControlBarReadyStage @relay(mask: false)
        }
      }
      meetingMembers {
        id
      }
      phases {
        stages {
          ...BottomControlBarReadyStage @relay(mask: false)
        }
      }
    }
  `
})
