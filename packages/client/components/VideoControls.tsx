import React, {lazy, useState} from 'react'
import styled from '@emotion/styled'
import withHotkey from 'react-hotkey-hoc'
import PrimaryButton from './PrimaryButton'
import MediaRoom from '../utils/mediaRoom/MediaRoom'
import AudioToggle from './AudioToggle'
import VideoToggle from './VideoToggle'
import useHotkey from '../hooks/useHotkey'
import useModal from '../hooks/useModal'
import {ProducersState, RoomState} from '../utils/mediaRoom/reducerMediaRoom'

interface Props {
  allowVideo: boolean
  bindHotkey: (key: string, cb: () => void) => void
  mediaRoom: MediaRoom
  producers: ProducersState
  room: RoomState
}

const AddVideoButton = styled(PrimaryButton)({
  alignSelf: 'center'
})

const ControlBlock = styled('div')({
  display: 'flex'
})

const ButtonWrapper = styled('div')({
  paddingRight: 8
})

const WebcamPermissionsModal = lazy(() =>
  import(/* webpackChunkName: 'WebcamPermissionsModal' */ './WebcamPermissionsModal')
)

const VideoControls = (props: Props) => {
  const {allowVideo, mediaRoom, producers, room} = props
  const [showVideoButton, setShowVideoButton] = useState(allowVideo)
  const [deviceStatus, setDeviceStatus] = useState<PushPermissionState>('granted')
  const {openPortal, modalPortal, closePortal} = useModal({background: 'rgba(0,0,0, 0.9)'})

  useHotkey('l o o k a t m e', () => {
    console.log('look')
    setShowVideoButton(true)
  })

  const addMedia = async () => {
    const descriptors = ['camera', 'microphone'] as PermissionName[]
    // https://caniuse.com/#feat=permissions-api
    const permissions =
      navigator.permissions && navigator.permissions.query
        ? await Promise.all(descriptors.map((name) => navigator.permissions.query({name})))
        : []
    const isPrompting = permissions.some(({state}) => state === 'prompt')
    if (isPrompting) {
      setDeviceStatus('prompt')
      openPortal()
    }
    try {
      await mediaRoom.connect()
    } catch (e) {
      setDeviceStatus('denied')
      openPortal()
      const onChange = () => {
        closePortal()
        addMedia().catch()
      }
      permissions.forEach((perm) => (perm.onchange = onChange))
      return
    }
  }
  if (!showVideoButton || !mediaRoom) return null
  if (room.state !== 'connected') {
    return (
      <>
        <AddVideoButton onClick={addMedia}>Add Video</AddVideoButton>
        {modalPortal(<WebcamPermissionsModal status={deviceStatus} />)}
      </>
    )
  }
  return (
    <ControlBlock>
      <ButtonWrapper>
        <VideoToggle producers={producers} mediaRoom={mediaRoom} />
      </ButtonWrapper>
      <ButtonWrapper>
        <AudioToggle producers={producers} mediaRoom={mediaRoom} />
      </ButtonWrapper>
    </ControlBlock>
  )
}

export default withHotkey(VideoControls)
