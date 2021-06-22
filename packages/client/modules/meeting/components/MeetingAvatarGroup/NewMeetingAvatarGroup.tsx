import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import AddTeamMemberAvatarButton from '../../../../components/AddTeamMemberAvatarButton'
import VideoControls from '../../../../components/VideoControls'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import useInitialRender from '../../../../hooks/useInitialRender'
import useTransition, {TransitionStatus} from '../../../../hooks/useTransition'
import {DECELERATE} from '../../../../styles/animation'
import {meetingAvatarMediaQueries} from '../../../../styles/meeting'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint} from '../../../../types/constEnums'
import MediaRoom from '../../../../utils/mediaRoom/MediaRoom'
import {
  ConsumersState,
  getConsumersForPeer,
  PeersState,
  ProducersState,
  RoomState
} from '../../../../utils/mediaRoom/reducerMediaRoom'
import {NewMeetingAvatarGroup_meeting} from '../../../../__generated__/NewMeetingAvatarGroup_meeting.graphql'
import NewMeetingAvatar from './NewMeetingAvatar'

const MeetingAvatarGroupRoot = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
  position: 'relative',
  textAlign: 'center'
})

const OverlappingBlock = styled('div')({
  backgroundColor: PALETTE.SLATE_200,
  borderRadius: '100%',
  marginLeft: -8,
  padding: 2,
  position: 'relative',
  ':first-of-type': {
    marginLeft: 0
  },
  [meetingAvatarMediaQueries[0]]: {
    marginLeft: -14,
    padding: 3
  }
})

const OverflowCount = styled('div')<{status: TransitionStatus}>(({status}) => ({
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  transition: `all 300ms ${DECELERATE}`,
  backgroundColor: PALETTE.SKY_400,
  borderRadius: '100%',
  color: '#FFFFFF',
  fontSize: 11,
  fontWeight: 600,
  height: 32,
  lineHeight: '32px',
  maxWidth: 32,
  paddingRight: 4,
  textAlign: 'center',
  userSelect: 'none',
  width: 32,
  [meetingAvatarMediaQueries[0]]: {
    fontSize: 14,
    height: 48,
    lineHeight: '48px',
    maxWidth: 48,
    paddingRight: 8,
    width: 48
  },
  [meetingAvatarMediaQueries[1]]: {
    fontSize: 16,
    height: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 8 : 56,
    lineHeight: '56px',
    maxWidth: 56,
    width: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 8 : 56
  }
}))

interface Props {
  meeting: NewMeetingAvatarGroup_meeting
  mediaRoom: MediaRoom | null
  allowVideo: boolean
  producers: ProducersState
  consumers: ConsumersState
  peers: PeersState
  room: RoomState
}

const MAX_AVATARS_DESKTOP = 7
const MAX_AVATARS_MOBILE = 3
const OVERFLOW_AVATAR = {key: 'overflow'}
const NewMeetingAvatarGroup = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {mediaRoom, meeting, allowVideo, peers, producers, consumers, room} = props
  const {id: meetingId, team, meetingMembers} = meeting
  const {id: teamId, teamMembers} = team
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)

  // all connected teamMembers except self
  const connectedMeetingMembers = useMemo(() => {
    return meetingMembers
      .filter((meetingMember) => {
        return (
          meetingMember.userId === viewerId ||
          (meetingMember.user.lastSeenAtURLs?.includes(`/meet/${meetingId}`) &&
            meetingMember.user.isConnected)
        )
      })
      .sort((a, b) =>
        a.userId === viewerId ? -1 : a.user.lastSeenAt! < b.user.lastSeenAt! ? -1 : 1
      )
      .map((tm) => ({
        ...tm,
        key: tm.userId
      }))
  }, [meetingMembers])
  const overflowThreshold = isDesktop ? MAX_AVATARS_DESKTOP : MAX_AVATARS_MOBILE
  const visibleConnectedMeetingMembers = connectedMeetingMembers.slice(0, overflowThreshold)
  const hiddenMeetingMemberCount =
    connectedMeetingMembers.length - visibleConnectedMeetingMembers.length
  const allAvatars =
    hiddenMeetingMemberCount === 0
      ? visibleConnectedMeetingMembers
      : visibleConnectedMeetingMembers.concat(OVERFLOW_AVATAR as any)
  const tranChildren = useTransition(allAvatars)
  const isInit = useInitialRender()
  return (
    <MeetingAvatarGroupRoot>
      <VideoControls
        room={room}
        allowVideo={allowVideo}
        mediaRoom={mediaRoom}
        producers={producers}
      />

      {tranChildren.map((meetingMember) => {
        if (meetingMember.child.key === 'overflow') {
          return (
            <OverlappingBlock key={'overflow'}>
              <OverflowCount
                status={isInit ? TransitionStatus.ENTERED : meetingMember.status}
                onTransitionEnd={meetingMember.onTransitionEnd}
              >{`+${hiddenMeetingMemberCount}`}</OverflowCount>
            </OverlappingBlock>
          )
        }
        const userId = meetingMember.child.userId
        const isSelf = userId == viewerId
        const peerProducers = isSelf ? Object.values(producers) : []
        const peerConsumers = isSelf ? [] : getConsumersForPeer(userId, peers, consumers)

        return (
          <OverlappingBlock key={meetingMember.child.id}>
            <NewMeetingAvatar
              teamMember={meetingMember.child.teamMember}
              onTransitionEnd={meetingMember.onTransitionEnd}
              status={isInit ? TransitionStatus.ENTERED : meetingMember.status}
              peerProducers={peerProducers || []}
              peerConsumers={peerConsumers || []}
              mediaRoom={mediaRoom}
              isSelf={isSelf}
            />
          </OverlappingBlock>
        )
      })}
      <OverlappingBlock>
        <AddTeamMemberAvatarButton
          meetingId={meetingId}
          teamId={teamId}
          teamMembers={teamMembers}
        />
      </OverlappingBlock>
    </MeetingAvatarGroupRoot>
  )
}

export default createFragmentContainer(NewMeetingAvatarGroup, {
  meeting: graphql`
    fragment NewMeetingAvatarGroup_meeting on NewMeeting {
      id
      team {
        id
        teamMembers {
          id
          ...AddTeamMemberAvatarButton_teamMembers
        }
      }
      meetingMembers {
        id
        userId
        user {
          isConnected
          lastSeenAt
          lastSeenAtURLs
        }
        teamMember {
          ...NewMeetingAvatar_teamMember
          id
        }
      }
    }
  `
})
