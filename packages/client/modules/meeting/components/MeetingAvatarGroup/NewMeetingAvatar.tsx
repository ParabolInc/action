import {NewMeetingAvatar_teamMember} from '../../../../__generated__/NewMeetingAvatar_teamMember.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import VideoAvatar from '../../../../components/Avatar/VideoAvatar'
import AudioAvatar from '../../../../components/Avatar/AudioAvatar'
import ErrorBoundary from '../../../../components/ErrorBoundary'
import MediaRoom from '../../../../utils/mediaRoom/MediaRoom'
import {ProducerState, ConsumerState} from '../../../../utils/mediaRoom/reducerMediaRoom'
import {meetingAvatarMediaQueries} from '../../../../styles/meeting'
import {TransitionStatus} from '../../../../hooks/useTransition'
import {DECELERATE} from '../../../../styles/animation'

const Item = styled('div')({
  position: 'relative'
})

const AvatarBlock = styled('div')<{status: TransitionStatus}>(({status}) => ({
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  transition: `all 300ms ${DECELERATE}`,
  borderRadius: '100%',
  height: 32,
  maxWidth: 32,
  width: 32,
  [meetingAvatarMediaQueries[0]]: {
    height: 48,
    maxWidth: 48,
    width: 48
  },
  [meetingAvatarMediaQueries[1]]: {
    height: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 8 : 56,
    maxWidth: 56,
    width: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 8 : 56
  }
}))

interface Props {
  onTransitionEnd: () => void
  status: TransitionStatus
  teamMember: NewMeetingAvatar_teamMember
  mediaRoom: MediaRoom | null
  peerProducers: ProducerState[]
  peerConsumers: ConsumerState[]
  isSelf: boolean
}

const NewMeetingAvatar = (props: Props) => {
  const {
    teamMember,
    mediaRoom,
    onTransitionEnd,
    status,
    peerProducers,
    peerConsumers,
    isSelf
  } = props
  const videoSource = isSelf
    ? peerProducers.find((producer) => producer.track.kind === 'video')
    : peerConsumers.find((consumer) => consumer.track.kind === 'video')
  const audioSource = isSelf
    ? peerProducers.find((producer) => producer.track.kind === 'audio')
    : peerConsumers.find((consumer) => consumer.track.kind === 'audio')
  return (
    <ErrorBoundary>
      <Item>
        <AvatarBlock status={status} onTransitionEnd={onTransitionEnd}>
          <VideoAvatar teamMember={teamMember} mediaRoom={mediaRoom} videoSource={videoSource} />
          <AudioAvatar isSelf={isSelf} mediaRoom={mediaRoom} audioSource={audioSource} />
        </AvatarBlock>
      </Item>
    </ErrorBoundary>
  )
}

export default createFragmentContainer(NewMeetingAvatar, {
  teamMember: graphql`
    fragment NewMeetingAvatar_teamMember on TeamMember {
      ...VideoAvatar_teamMember
    }
  `
})
