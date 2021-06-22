import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StageTimerModalEditTimeLimit_stage} from '../__generated__/StageTimerModalEditTimeLimit_stage.graphql'
import styled from '@emotion/styled'
import StageTimerModalTimeLimit from './StageTimerModalTimeLimit'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'
import SetStageTimerMutation from '../mutations/SetStageTimerMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import MenuItemHR from './MenuItemHR'
import {PALETTE} from '../styles/paletteV3'
import {MeetingLabels} from '../types/constEnums'

interface Props {
  meetingId: string
  stage: StageTimerModalEditTimeLimit_stage
  closePortal: () => void
}

const Modal = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
})

const EndTimer = styled(PlainButton)({
  alignItems: 'center',
  display: 'flex',
  width: '100%',
  padding: '8px 16px'
})

const Label = styled('div')({
  lineHeight: 1,
  paddingLeft: 16,
  fontSize: 14
})

const HR = styled(MenuItemHR)({
  marginBottom: -8,
  width: '100%'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600
})

const StageTimerModalEditTimeLimit = (props: Props) => {
  const {meetingId, closePortal, stage} = props
  const atmosphere = useAtmosphere()
  const {submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const endTimer = () => {
    if (submitting) return
    submitMutation()
    SetStageTimerMutation(atmosphere, {meetingId, scheduledEndTime: null}, {onError, onCompleted})
    closePortal()
  }
  return (
    <Modal>
      <EndTimer onClick={endTimer}>
        <StyledIcon>timer_off</StyledIcon>
        <Label>End {MeetingLabels.TIMER}</Label>
      </EndTimer>
      <HR />
      <StageTimerModalTimeLimit
        closePortal={closePortal}
        stage={stage}
        meetingId={meetingId}
        defaultTimeLimit={1}
      />
    </Modal>
  )
}

export default createFragmentContainer(StageTimerModalEditTimeLimit, {
  stage: graphql`
    fragment StageTimerModalEditTimeLimit_stage on NewMeetingStage {
      ...StageTimerModalTimeLimit_stage
    }
  `
})
