import plural from '../utils/plural'
import StageTimerMinutePicker from './StageTimerMinutePicker'
import SecondaryButton from './SecondaryButton'
import React, {useState} from 'react'
import useMenu from '../hooks/useMenu'
import {MenuPosition} from '../hooks/useCoords'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import DropdownMenuToggle from './DropdownMenuToggle'
import {StageTimerModalTimeLimit_stage} from '../__generated__/StageTimerModalTimeLimit_stage.graphql'
import ms from 'ms'
import SetStageTimerMutation from '../mutations/SetStageTimerMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import StyledError from './StyledError'
import Icon from './Icon'
import {PALETTE} from '../styles/paletteV3'
import {MeetingLabels} from '../types/constEnums'

interface Props {
  closePortal: () => void
  defaultTimeLimit: number
  meetingId: string
  stage: StageTimerModalTimeLimit_stage
}

const Toggle = styled(DropdownMenuToggle)({
  padding: '8px 0 8px 8px',
  minWidth: 160
})

const Row = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
})

const SetLimit = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: '16px 16px 8px'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600
})

const StyledButton = styled(SecondaryButton)({
  marginTop: 8,
  minWidth: 192
})

const StageTimerModalTimeLimit = (props: Props) => {
  const {closePortal, defaultTimeLimit, meetingId, stage} = props
  const {suggestedTimeLimit, scheduledEndTime} = stage
  const initialTimeLimit =
    scheduledEndTime || !suggestedTimeLimit
      ? defaultTimeLimit
      : Math.min(10, Math.max(1, Math.round(suggestedTimeLimit / ms('1m'))))
  // scheduledEndTime means we're editing an existing timer
  const atmosphere = useAtmosphere()
  const [minuteTimeLimit, setMinuteTimeLimit] = useState(initialTimeLimit)
  const {menuPortal, togglePortal, menuProps: minutePickerProps, originRef} = useMenu<
    HTMLDivElement
  >(MenuPosition.LOWER_LEFT, {
    id: 'StageTimerMinutePicker',
    parentId: 'StageTimerModal',
    isDropdown: true
  })
  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()
  const startTimer = () => {
    if (submitting) return
    const spareTime = scheduledEndTime
      ? Math.max(0, new Date(scheduledEndTime).getTime() - Date.now())
      : 0
    const timeRemaining = minuteTimeLimit * ms('1m') + spareTime
    submitMutation()
    SetStageTimerMutation(
      atmosphere,
      {meetingId, timeRemaining, scheduledEndTime: new Date(Date.now() + timeRemaining)},
      {onError, onCompleted}
    )
    closePortal()
  }

  return (
    <SetLimit>
      <Row>
        <StyledIcon>timer</StyledIcon>
        <Toggle
          defaultText={`${minuteTimeLimit} ${plural(minuteTimeLimit, 'minute')}`}
          onClick={togglePortal}
          ref={originRef}
          size='small'
          flat
        />
      </Row>
      {menuPortal(
        <StageTimerMinutePicker
          minuteTimeLimit={minuteTimeLimit}
          menuProps={minutePickerProps}
          setMinuteTimeLimit={setMinuteTimeLimit}
        />
      )}
      <StyledButton onClick={startTimer}>
        {scheduledEndTime ? 'Add Time' : `Start ${MeetingLabels.TIMER}`}
      </StyledButton>
      {error && <StyledError>{error.message}</StyledError>}
    </SetLimit>
  )
}

export default createFragmentContainer(StageTimerModalTimeLimit, {
  stage: graphql`
    fragment StageTimerModalTimeLimit_stage on NewMeetingStage {
      suggestedTimeLimit
      scheduledEndTime
    }
  `
})
