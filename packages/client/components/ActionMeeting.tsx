import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement, useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ActionMeeting_meeting} from '~/__generated__/ActionMeeting_meeting.graphql'
import useMeeting from '../hooks/useMeeting'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {ValueOf} from '../types/generics'
import {NewMeetingPhaseTypeEnum} from '../__generated__/ActionMeeting_meeting.graphql'
import lazyPreload from '../utils/lazyPreload'
import ActionMeetingSidebar from './ActionMeetingSidebar'
import MeetingArea from './MeetingArea'
import MeetingControlBar from './MeetingControlBar'
import MeetingStyles from './MeetingStyles'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'

interface Props {
  meeting: ActionMeeting_meeting
}

const phaseLookup = {
  ['checkin']: lazyPreload(() =>
    import(/* webpackChunkName: 'NewMeetingCheckIn' */ './NewMeetingCheckIn')
  ),
  ['updates']: lazyPreload(() =>
    import(/* webpackChunkName: 'ActionMeetingUpdates' */ './ActionMeetingUpdates')
  ),
  ['firstcall']: lazyPreload(() =>
    import(/* webpackChunkName: 'ActionMeetingFirstCall' */ './ActionMeetingFirstCall')
  ),
  ['agendaitems']: lazyPreload(() =>
    import(/* webpackChunkName: 'ActionMeetingAgendaItems' */ './ActionMeetingAgendaItems')
  ),
  ['lastcall']: lazyPreload(() =>
    import(/* webpackChunkName: 'ActionMeetingLastCall' */ './ActionMeetingLastCall')
  )
} as Record<NewMeetingPhaseTypeEnum, any>

type PhaseComponent = ValueOf<typeof phaseLookup>

export interface ActionMeetingPhaseProps {
  avatarGroup: ReactElement
  toggleSidebar: () => void
}

const ActionMeeting = (props: Props) => {
  const {meeting} = props
  const {localPhase, showSidebar, viewerMeetingMember} = meeting
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
    handleMenuClick
  } = useMeeting(meeting)
  useEffect(() => {
    Object.values(phaseLookup).forEach((lazy) => lazy.preload())
  }, [])
  if (!safeRoute) return null
  const allowVideo = !!viewerMeetingMember?.user?.featureFlags?.video
  const localPhaseType = (localPhase && localPhase.phaseType) || 'lobby'
  const Phase = phaseLookup[localPhaseType] as PhaseComponent
  return (
    <MeetingStyles>
      <ResponsiveDashSidebar isOpen={showSidebar} onToggle={toggleSidebar}>
        <ActionMeetingSidebar
          gotoStageId={gotoStageId}
          handleMenuClick={handleMenuClick}
          toggleSidebar={toggleSidebar}
          meeting={meeting}
        />
      </ResponsiveDashSidebar>
      <MeetingArea>
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
      </MeetingArea>
      <MeetingControlBar
        meeting={meeting}
        handleGotoNext={handleGotoNext}
        gotoStageId={gotoStageId}
      />
    </MeetingStyles>
  )
}

export default createFragmentContainer(ActionMeeting, {
  meeting: graphql`
    fragment ActionMeeting_meeting on ActionMeeting {
      ...useMeeting_meeting
      ...ActionMeetingSidebar_meeting
      ...NewMeetingCheckIn_meeting
      ...ActionMeetingUpdates_meeting
      ...ActionMeetingFirstCall_meeting
      ...ActionMeetingAgendaItems_meeting
      ...ActionMeetingLastCall_meeting
      ...NewMeetingAvatarGroup_meeting
      ...MeetingControlBar_meeting
      localPhase {
        id
        phaseType
      }
      phases {
        id
        phaseType
      }
      showSidebar
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
