import React from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import MediaRoom from '../utils/mediaRoom/MediaRoom'
import MediaControlToggle from './MediaControlToggle'
import {ICON_SIZE} from '../styles/typographyV2'
import {ProducersState} from '../utils/mediaRoom/reducerMediaRoom'

const Toggle = styled(MediaControlToggle)({})
const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18
})

interface Props {
  mediaRoom: MediaRoom
  producers: ProducersState
}

const VideoToggle = (props: Props) => {
  const {mediaRoom, producers} = props
  const videoProducer = Object.values(producers).find((producer) => producer.track.kind === 'video')
  const videoEnabled = videoProducer && !videoProducer.paused
  const onClick = async () => {
    if (videoEnabled) {
      await mediaRoom.disableWebcam()
    } else {
      try {
        await mediaRoom.enableWebcam()
      } catch (e) {
        /**/
      }
    }
  }
  return (
    <Toggle onClick={onClick}>
      <StyledIcon>{videoEnabled ? 'videocam' : 'videocam_off'}</StyledIcon>
    </Toggle>
  )
}

export default VideoToggle
