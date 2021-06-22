import {VideoAvatar_teamMember} from '../../__generated__/VideoAvatar_teamMember.graphql'
import React, {forwardRef, Ref, useRef} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import MediaRoom from '../../utils/mediaRoom/MediaRoom'
import {ProducerState, ConsumerState} from '../../utils/mediaRoom/reducerMediaRoom'
import useMedia from '../../hooks/useMedia'

const AvatarStyle = styled('div')({
  height: '100%', // needed to not pancake in firefox
  position: 'relative',
  width: '100%'
})

interface StyleProps {
  isHidden: boolean
}
const Video = styled('video')<StyleProps>(({isHidden}) => ({
  display: isHidden ? 'none' : undefined,
  borderRadius: '100%',
  height: '100%',
  objectFit: 'cover', // fill will squish it, cover cuts off the edges
  minHeight: '100%', // needed to not pancake in firefox
  transform: 'rotateY(180deg)',
  width: '100%'
}))

const Picture = styled('img')<StyleProps>(({isHidden}) => ({
  display: isHidden ? 'none' : undefined,
  borderRadius: '100%',
  height: '100%',
  objectFit: 'cover', // fill will squish it, cover cuts off the edges
  minHeight: '100%', // needed to not pancake in firefox
  width: '100%'
}))

interface Props {
  teamMember: VideoAvatar_teamMember
  mediaRoom: MediaRoom | null
  onClick?: () => void
  onMouseEnter?: () => void
  videoSource: ProducerState | ConsumerState | undefined
}

const VideoAvatar = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const {teamMember, /*mediaRoom,*/ videoSource} = props
  const {isSelf, picture} = teamMember
  const videoEnabled = useMedia({
    mediaRef: videoRef,
    mediaSource: videoSource
  })
  return (
    <AvatarStyle ref={ref}>
      <Picture src={picture} isHidden={videoEnabled} />
      <Video ref={videoRef} isHidden={!videoEnabled} autoPlay muted={isSelf} />
    </AvatarStyle>
  )
})

export default createFragmentContainer(VideoAvatar, {
  teamMember: graphql`
    fragment VideoAvatar_teamMember on TeamMember {
      isSelf
      picture
    }
  `
})
