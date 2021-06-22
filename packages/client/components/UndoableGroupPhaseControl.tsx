import React from 'react'
import ResetMeetingToStageMutation from '~/mutations/ResetMeetingToStageMutation'
import useAtmosphere from '~/hooks/useAtmosphere'
import useHotkey from '~/hooks/useHotkey'
import useModal from '~/hooks/useModal'
import lazyPreload from '~/utils/lazyPreload'
import styled from '@emotion/styled'
import FlatButton from '~/components/FlatButton'
import Icon from '~/components/Icon'

interface Props {
  meetingId: string
  resetToStageId: string
}

const StyledButton = styled(FlatButton)({
  fontWeight: 600,
  height: 28,
  marginLeft: 16,
  padding: 0
})

const StyledIcon = styled(Icon)({
  marginRight: 4
})

const UndoableGroupPhaseDialog = lazyPreload(() =>
  import(/* webpackChunkName: 'UndoableGroupPhaseDialog' */ './UndoableGroupPhaseDialog')
)

const UndoableGroupPhaseControl = (props: Props) => {
  const {meetingId, resetToStageId} = props
  const {togglePortal: toggleModal, closePortal: closeModal, modalPortal} = useModal()
  const atmosphere = useAtmosphere()
  useHotkey('i d i d n t m e a n t o', () => {
    console.log('didntmean')
    ResetMeetingToStageMutation(atmosphere, {meetingId, stageId: resetToStageId})
  })
  return (
    <>
      <StyledButton onClick={toggleModal} palette={'blue'}><StyledIcon>edit</StyledIcon>{' Edit Groups'}</StyledButton>
      {modalPortal(<UndoableGroupPhaseDialog closePortal={closeModal} meetingId={meetingId} resetToStageId={resetToStageId} />)}
    </>
  )
}

export default UndoableGroupPhaseControl
