import MediaRoom from '../../utils/mediaRoom/MediaRoom'
import {ProducerState, ConsumerState} from '../../utils/mediaRoom/reducerMediaRoom'
import React, {useRef} from 'react'
import useMedia from '../../hooks/useMedia'

interface Props {
  mediaRoom: MediaRoom | null
  audioSource: ProducerState | ConsumerState | undefined
  isSelf: boolean
}

const AudioAvatar = (props: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const {/*mediaRoom,*/ audioSource, isSelf} = props
  const audioEnabled = useMedia({
    mediaRef: audioRef,
    mediaSource: audioSource
  })
  return <audio ref={audioRef} autoPlay muted={isSelf || !audioEnabled} controls={false} />
}

export default AudioAvatar
