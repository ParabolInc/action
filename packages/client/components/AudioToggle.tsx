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
  producers: ProducersState
  mediaRoom: MediaRoom
}

const AudioToggle = (props: Props) => {
  const {mediaRoom, producers} = props
  const audioProducer = Object.values(producers).find((producer) => producer.track.kind === 'audio')
  const audioEnabled = audioProducer && !audioProducer.paused
  const onClick = async () => {
    if (audioEnabled) {
      mediaRoom.muteMic()
    } else {
      try {
        await mediaRoom.unmuteMic()
      } catch (e) {
        /**/
      }
    }
  }
  return (
    <Toggle onClick={onClick}>
      <StyledIcon>{audioEnabled ? 'mic' : 'mic_off'}</StyledIcon>
    </Toggle>
  )
}

export default AudioToggle
