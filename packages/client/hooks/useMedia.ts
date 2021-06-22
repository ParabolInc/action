import {ProducerState, ConsumerState} from '../utils/mediaRoom/reducerMediaRoom'
import {useEffect} from 'react'

interface useMediaSignature {
  mediaRef: React.RefObject<HTMLVideoElement> | React.RefObject<HTMLAudioElement>
  mediaSource: ProducerState | ConsumerState | undefined
}

const useMedia = ({mediaRef, mediaSource}: useMediaSignature) => {
  useEffect(() => {
    if (mediaSource?.track) {
      const stream = new MediaStream()
      stream.addTrack(mediaSource.track)
      const el = mediaRef.current!
      if (el.srcObject !== stream) el.srcObject = stream! // conditional is required to remove flickering video on update
    }
  }, [mediaRef, mediaSource])
  if (!mediaSource) return false
  if ((mediaSource as ProducerState).paused) return false
  if ((mediaSource as ConsumerState).locallyPaused) return false
  if ((mediaSource as ConsumerState).remotelyPaused) return false
  return true
}

export default useMedia
