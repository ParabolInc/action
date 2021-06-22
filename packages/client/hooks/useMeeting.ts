import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import isDemoRoute from '~/utils/isDemoRoute'
import {useMeeting_meeting} from '~/__generated__/useMeeting_meeting.graphql'
import {Breakpoint} from '../types/constEnums'
import useAutoCheckIn from './useAutoCheckIn'
import useBreakpoint from './useBreakpoint'
import useDemoMeeting from './useDemoMeeting'
import useDocumentTitle from './useDocumentTitle'
import useEndMeetingHotkey from './useEndMeetingHotkey'
import useGotoNext from './useGotoNext'
import useGotoNextHotkey from './useGotoNextHotkey'
import useGotoPrevHotkey from './useGotoPrevHotkey'
import useGotoStageId from './useGotoStageId'
import useHandleMenuClick from './useHandleMenuClick'
import useMediaRoom from './useMediaRoom'
import useMeetingLocalState from './useMeetingLocalState'
import useMobileSidebarDefaultClosed from './useMobileSidebarDefaultClosed'
import useToggleSidebar from './useToggleSidebar'

const useMeeting = (meetingRef: any) => {
  const meeting = readInlineData<useMeeting_meeting>(
    graphql`
      fragment useMeeting_meeting on NewMeeting @inline {
        ...useGotoStageId_meeting
        ...useGotoNext_meeting
        ...useGotoPrev_meeting
        ...useMeetingLocalState_meeting
        ...useAutoCheckIn_meeting
        id
        meetingType
        name
        showSidebar
        team {
          id
          name
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, meetingType, name: meetingName, team} = meeting
  const {id: teamId, name: teamName} = team
  const gotoStageId = useGotoStageId(meeting)
  const handleGotoNext = useGotoNext(meeting, gotoStageId)
  const safeRoute = useMeetingLocalState(meeting)
  useEndMeetingHotkey(meetingId, meetingType)
  useGotoNextHotkey(handleGotoNext.gotoNext)
  useGotoPrevHotkey(meeting, gotoStageId)
  // save a few cycles
  const demoPortal = isDemoRoute() ? useDemoMeeting() : () => null // eslint-disable-line
  useDocumentTitle(`${meetingName} | ${teamName}`, meetingName)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const toggleSidebar = useToggleSidebar(meetingId)
  const handleMenuClick = useHandleMenuClick(teamId, isDesktop)
  useMobileSidebarDefaultClosed(isDesktop, meetingId)
  const {room, peers, consumers, producers, mediaRoom} = useMediaRoom(meetingId, teamId)
  useAutoCheckIn(meeting)
  return {
    demoPortal,
    handleGotoNext,
    gotoStageId,
    safeRoute,
    toggleSidebar,
    room,
    peers,
    consumers,
    producers,
    mediaRoom,
    isDesktop,
    handleMenuClick
  }
}

export default useMeeting
