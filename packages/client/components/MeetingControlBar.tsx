import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useBreakpoint from '~/hooks/useBreakpoint'
import {useCovering} from '~/hooks/useControlBarCovers'
import useDraggableFixture from '~/hooks/useDraggableFixture'
import useGotoNext from '~/hooks/useGotoNext'
import useGotoStageId from '~/hooks/useGotoStageId'
import useInitialRender from '~/hooks/useInitialRender'
import useLeft from '~/hooks/useLeft'
import useTransition, {TransitionStatus} from '~/hooks/useTransition'
import {PALETTE} from '~/styles/paletteV3'
import {BezierCurve, Breakpoint, ElementWidth, ZIndex} from '~/types/constEnums'
import {NewMeetingPhaseTypeEnum} from '../__generated__/MeetingControlBar_meeting.graphql'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import findStageAfterId from '~/utils/meetings/findStageAfterId'
import {MeetingControlBar_meeting} from '~/__generated__/MeetingControlBar_meeting.graphql'
import useClickConfirmation from '../hooks/useClickConfirmation'
import {bottomBarShadow, desktopBarShadow} from '../styles/elevation'
import BottomControlBarReady from './BottomControlBarReady'
import BottomControlBarRejoin from './BottomControlBarRejoin'
import BottomControlBarTips from './BottomControlBarTips'
import EndMeetingButton from './EndMeetingButton'
import StageTimerControl from './StageTimerControl'

const Wrapper = styled('div')<{left: number}>(({left}) => ({
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  bottom: 0,
  boxShadow: bottomBarShadow,
  color: PALETTE.SLATE_600,
  display: 'flex',
  flexWrap: 'nowrap',
  fontSize: 14,
  height: 56,
  justifyContent: 'space-between',
  left,
  minHeight: 56,
  padding: ElementWidth.CONTROL_BAR_PADDING,
  position: 'fixed',
  transition: `all 200ms ${BezierCurve.DECELERATE}`,
  width: '100%',
  zIndex: ZIndex.BOTTOM_BAR,
  [makeMinWidthMediaQuery(Breakpoint.SINGLE_REFLECTION_COLUMN)]: {
    borderRadius: 4,
    bottom: 8,
    boxShadow: desktopBarShadow,
    width: 'auto'
  }
}))

const DEFAULT_TIME_LIMIT = {
  reflect: 5,
  group: 5,
  vote: 3,
  discuss: 5
} as Record<NewMeetingPhaseTypeEnum, number>

interface Props {
  handleGotoNext: ReturnType<typeof useGotoNext>
  isDemoStageComplete?: boolean
  gotoStageId: ReturnType<typeof useGotoStageId>
  meeting: MeetingControlBar_meeting
}
const MeetingControlBar = (props: Props) => {
  const {handleGotoNext, isDemoStageComplete, meeting, gotoStageId} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {
    endedAt,
    facilitatorUserId,
    facilitatorStageId,
    localPhase,
    id: meetingId,
    localStage,
    phases,
    meetingType,
    showSidebar,
    isRightDrawerOpen = false
  } = meeting
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const {phaseType} = localPhase
  const {id: localStageId, isComplete} = localStage
  const isCheckIn = phaseType === 'checkin'
  const isRetro = meetingType === 'retrospective'
  const isPoker = meetingType === 'poker'
  const getPossibleButtons = () => {
    const buttons = ['tips']
    if (!isFacilitating && !isCheckIn && !isComplete && !isPoker) buttons.push('ready')
    if (!isFacilitating && localStageId !== facilitatorStageId) buttons.push('rejoin')
    if (isFacilitating && isRetro && !isCheckIn && !isComplete) buttons.push('timer')
    if ((isFacilitating || isPoker) && findStageAfterId(phases, localStageId)) buttons.push('next')
    if (isFacilitating) buttons.push('end')
    return buttons.map((key) => ({key}))
  }
  const buttons = getPossibleButtons()
  const [confirmingButton, setConfirmingButton] = useClickConfirmation()
  const cancelConfirm = confirmingButton ? () => setConfirmingButton('') : undefined
  const tranChildren = useTransition(buttons)
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const controlBarWidth =
    buttons.length * ElementWidth.CONTROL_BAR_BUTTON + ElementWidth.CONTROL_BAR_PADDING * 2
  const left = useLeft(controlBarWidth, isRightDrawerOpen, showSidebar)
  const controlBarLeft = isDesktop ? left : 0
  const {onMouseDown, onClickCapture} = useDraggableFixture(showSidebar, isRightDrawerOpen)
  const ref = useRef<HTMLDivElement>(null)
  useCovering(ref)
  const isInit = useInitialRender()
  if (endedAt) return null
  return (
    <Wrapper
      ref={ref}
      left={controlBarLeft}
      onMouseDown={onMouseDown}
      onClickCapture={onClickCapture}
      onTouchStart={onMouseDown}
    >
      {tranChildren
        .map((tranChild) => {
          const {onTransitionEnd, child, status} = tranChild
          const {key} = child
          const tranProps = {
            onTransitionEnd,
            status: isInit ? TransitionStatus.ENTERED : status,
            key
          }
          switch (key) {
            case 'tips':
              return (
                <BottomControlBarTips
                  {...tranProps}
                  meeting={meeting}
                  cancelConfirm={cancelConfirm}
                />
              )
            case 'ready':
            case 'next':
              return (
                <BottomControlBarReady
                  {...tranProps}
                  isNext={isPoker ? true : isFacilitating}
                  cancelConfirm={
                    isPoker ? undefined : confirmingButton === 'next' ? undefined : cancelConfirm
                  }
                  isConfirming={isPoker ? false : confirmingButton === 'next'}
                  setConfirmingButton={setConfirmingButton}
                  isDemoStageComplete={isDemoStageComplete}
                  meeting={meeting}
                  handleGotoNext={handleGotoNext}
                />
              )
            case 'rejoin':
              return (
                <BottomControlBarRejoin
                  {...tranProps}
                  onClick={() => gotoStageId(facilitatorStageId)}
                />
              )
            case 'timer':
              return (
                <StageTimerControl
                  {...tranProps}
                  cancelConfirm={cancelConfirm}
                  defaultTimeLimit={DEFAULT_TIME_LIMIT[phaseType]}
                  meeting={meeting}
                />
              )
            case 'end':
              return (
                <EndMeetingButton
                  {...tranProps}
                  cancelConfirm={confirmingButton === 'end' ? undefined : cancelConfirm}
                  isConfirming={confirmingButton === 'end'}
                  setConfirmingButton={setConfirmingButton}
                  meetingId={meetingId}
                  meetingType={meetingType}
                  isEnded={!!endedAt}
                />
              )
            default:
              return null
          }
        })
        .filter(Boolean)}
    </Wrapper>
  )
}

export default createFragmentContainer(MeetingControlBar, {
  meeting: graphql`
    fragment MeetingControlBar_meeting on NewMeeting {
      ...BottomControlBarTips_meeting
      ...BottomControlBarReady_meeting
      ...StageTimerControl_meeting
      id
      endedAt
      facilitatorStageId
      facilitatorUserId
      meetingType
      showSidebar
      ... on PokerMeeting {
        isRightDrawerOpen
      }
      localStage {
        id
        isComplete
      }
      localPhase {
        phaseType
        stages {
          id
          isComplete
        }
      }
      phases {
        phaseType
        stages {
          id
        }
      }
    }
  `
})
