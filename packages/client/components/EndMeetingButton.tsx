import styled from '@emotion/styled'
import React, {forwardRef, Ref} from 'react'
import {TransitionStatus} from '~/hooks/useTransition'
import EndCheckInMutation from '~/mutations/EndCheckInMutation'
import EndRetrospectiveMutation from '~/mutations/EndRetrospectiveMutation'
import {PALETTE} from '~/styles/paletteV3'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuPosition} from '../hooks/useCoords'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import useTooltip from '../hooks/useTooltip'
import EndSprintPokerMutation from '../mutations/EndSprintPokerMutation'
import {ElementWidth, Times} from '../types/constEnums'
import isDemoRoute from '../utils/isDemoRoute'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import Icon from './Icon'

const FlagIcon = styled(Icon)({
  color: PALETTE.SKY_500,
  height: 24
})

interface Props {
  cancelConfirm: undefined | (() => void)
  isConfirming: boolean
  setConfirmingButton: (button: string) => void
  meetingId: string
  meetingType: string
  isEnded: boolean
  status: TransitionStatus
  onTransitionEnd: () => void
}

const EndMeetingButtonStyles = styled(BottomNavControl)({
  width: ElementWidth.CONTROL_BAR_BUTTON
})

const EndMeetingButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {
    cancelConfirm,
    isConfirming,
    setConfirmingButton,
    isEnded,
    meetingType,
    meetingId,
    status,
    onTransitionEnd
  } = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const {openTooltip, tooltipPortal, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER,
    {
      disabled: !isConfirming,
      delay: Times.MEETING_CONFIRM_TOOLTIP_DELAY
    }
  )
  const endMeeting = () => {
    if (submitting) return
    if (isConfirming) {
      setConfirmingButton('')
      submitMutation()
      if (meetingType === 'poker') {
        EndSprintPokerMutation(atmosphere, {meetingId}, {history, onError, onCompleted})
      } else if (meetingType === 'action') {
        EndCheckInMutation(atmosphere, {meetingId}, {history, onError, onCompleted})
      } else {
        EndRetrospectiveMutation(atmosphere, {meetingId}, {history, onError, onCompleted})
      }
    } else {
      setConfirmingButton('end')
      setTimeout(openTooltip)
    }
  }

  const label = isDemoRoute() ? 'End Demo' : 'End Meeting'
  return (
    <>
      <EndMeetingButtonStyles
        confirming={!!cancelConfirm}
        dataCy='end-button'
        onClick={cancelConfirm || endMeeting}
        waiting={submitting}
        ref={ref}
        disabled={isEnded}
        status={status}
        onTransitionEnd={onTransitionEnd}
      >
        <BottomNavIconLabel label={label} ref={originRef}>
          <FlagIcon>{'flag'}</FlagIcon>
        </BottomNavIconLabel>
      </EndMeetingButtonStyles>
      {tooltipPortal(`Tap '${label}' again to Confirm`)}
    </>
  )
})

export default EndMeetingButton
