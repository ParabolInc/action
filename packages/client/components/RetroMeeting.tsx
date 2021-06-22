import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement, Suspense} from 'react'
import {createFragmentContainer} from 'react-relay'
import {
  NewMeetingPhaseTypeEnum,
  RetroMeeting_meeting
} from '~/__generated__/RetroMeeting_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMeeting from '../hooks/useMeeting'
import LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {RetroDemo} from '../types/constEnums'
import lazyPreload, {LazyExoticPreload} from '../utils/lazyPreload'
import MeetingControlBar from './MeetingControlBar'
import MeetingStyles from './MeetingStyles'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroMeetingSidebar from './RetroMeetingSidebar'

interface Props {
  meeting: RetroMeeting_meeting
}

const phaseLookup = {
  checkin: lazyPreload(() =>
    import(/* webpackChunkName: 'NewMeetingCheckIn' */ './NewMeetingCheckIn')
  ),
  reflect: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroReflectPhase' */ './RetroReflectPhase/RetroReflectPhase')
  ),
  group: lazyPreload(() => import(/* webpackChunkName: 'RetroGroupPhase' */ './RetroGroupPhase')),
  vote: lazyPreload(() => import(/* webpackChunkName: 'RetroVotePhase' */ './RetroVotePhase')),
  discuss: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroDiscussPhase' */ './RetroDiscussPhase')
  )
} as Record<NewMeetingPhaseTypeEnum, LazyExoticPreload<any>>

export interface RetroMeetingPhaseProps {
  toggleSidebar: () => void
  meeting: any
  avatarGroup: ReactElement
}

const RetroMeeting = (props: Props) => {
  const {meeting} = props
  const {
    toggleSidebar,
    room,
    peers,
    producers,
    consumers,
    mediaRoom,
    handleGotoNext,
    gotoStageId,
    safeRoute,
    handleMenuClick,
    demoPortal
  } = useMeeting(meeting)
  const atmosphere = useAtmosphere()
  if (!safeRoute) return null
  const {id: meetingId, showSidebar, viewerMeetingMember, localPhase} = meeting
  const allowVideo = !!viewerMeetingMember?.user?.featureFlags?.video
  const localPhaseType = localPhase?.phaseType
  const Phase = phaseLookup[localPhaseType]

  const isDemoStageComplete =
    meetingId === RetroDemo.MEETING_ID
      ? ((atmosphere as unknown) as LocalAtmosphere).clientGraphQLServer.isBotFinished()
      : false
  return (
    <MeetingStyles>
      {demoPortal()}
      <ResponsiveDashSidebar isOpen={showSidebar} onToggle={toggleSidebar}>
        <RetroMeetingSidebar
          gotoStageId={gotoStageId}
          handleMenuClick={handleMenuClick}
          toggleSidebar={toggleSidebar}
          meeting={meeting}
        />
      </ResponsiveDashSidebar>
      <Suspense fallback={''}>
        <Phase
          meeting={meeting}
          toggleSidebar={toggleSidebar}
          avatarGroup={
            <NewMeetingAvatarGroup
              allowVideo={allowVideo}
              room={room}
              peers={peers}
              producers={producers}
              consumers={consumers}
              mediaRoom={mediaRoom}
              meeting={meeting}
            />
          }
        />
      </Suspense>
      <MeetingControlBar
        isDemoStageComplete={isDemoStageComplete}
        meeting={meeting}
        handleGotoNext={handleGotoNext}
        gotoStageId={gotoStageId}
      />
    </MeetingStyles>
  )
}

export default createFragmentContainer(RetroMeeting, {
  meeting: graphql`
    fragment RetroMeeting_meeting on RetrospectiveMeeting {
      ...useMeeting_meeting
      ...RetroMeetingSidebar_meeting
      ...NewMeetingCheckIn_meeting
      ...RetroReflectPhase_meeting
      ...RetroGroupPhase_meeting
      ...RetroVotePhase_meeting
      ...RetroDiscussPhase_meeting
      ...NewMeetingAvatarGroup_meeting
      ...MeetingControlBar_meeting
      id
      showSidebar
      localPhase {
        phaseType
      }
      phases {
        phaseType
        stages {
          id
        }
      }
      viewerMeetingMember {
        user {
          featureFlags {
            video
          }
        }
      }
    }
  `
})
