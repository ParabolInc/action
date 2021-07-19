import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useGotoStageId from '../hooks/useGotoStageId'
import getSidebarItemStage from '../utils/getSidebarItemStage'
import findStageById from '../utils/meetings/findStageById'
import {
  ActionMeetingSidebar_meeting,
  NewMeetingPhaseTypeEnum
} from '../__generated__/ActionMeetingSidebar_meeting.graphql'
import ActionSidebarPhaseListItemChildren from './ActionSidebarPhaseListItemChildren'
import MeetingNavList from './MeetingNavList'
import NewMeetingSidebar from './NewMeetingSidebar'
import NewMeetingSidebarPhaseListItem from './NewMeetingSidebarPhaseListItem'
import useMaxChildHeight from '../hooks/useMaxChildHeight'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  toggleSidebar: () => void
  meeting: ActionMeetingSidebar_meeting
}

const blackList: NewMeetingPhaseTypeEnum[] = ['firstcall', 'lastcall']
const collapsiblePhases: NewMeetingPhaseTypeEnum[] = ['checkin', 'updates', 'agendaitems']

const ActionMeetingSidebar = (props: Props) => {
  const {gotoStageId, handleMenuClick, toggleSidebar, meeting} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {team, settings} = meeting
  const {agendaItems} = team
  const {phaseTypes} = settings
  const {facilitatorUserId, facilitatorStageId, localPhase, localStage, phases} = meeting
  const navPhasesRef = useRef<HTMLDivElement>(null)
  const maxChildHeight = useMaxChildHeight(
    navPhasesRef,
    collapsiblePhases.length,
    agendaItems.length === 0
  )
  const localPhaseType = localPhase ? localPhase.phaseType : ''
  const facilitatorStageRes = findStageById(phases, facilitatorStageId)
  const facilitatorPhaseType = facilitatorStageRes ? facilitatorStageRes.phase.phaseType : ''
  const isViewerFacilitator = facilitatorUserId === viewerId
  const isUnsyncedFacilitatorPhase = facilitatorPhaseType !== localPhaseType
  const isUnsyncedFacilitatorStage = localStage ? localStage.id !== facilitatorStageId : undefined
  return (
    <NewMeetingSidebar
      handleMenuClick={handleMenuClick}
      toggleSidebar={toggleSidebar}
      meeting={meeting}
      navPhasesRef={navPhasesRef}
    >
      <MeetingNavList>
        {phaseTypes
          .filter((phaseType) => !blackList.includes(phaseType))
          .map((phaseType) => {
            const itemStage = getSidebarItemStage(phaseType, phases, facilitatorStageId)
            const {id: itemStageId = '', isNavigable = false, isNavigableByFacilitator = false} =
              itemStage || {}
            const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
            const handleClick = () => {
              gotoStageId(itemStageId).catch()
              handleMenuClick()
            }
            const phaseCount =
              phaseType === 'agendaitems' && agendaItems ? agendaItems.length : undefined
            return (
              <NewMeetingSidebarPhaseListItem
                handleClick={canNavigate ? handleClick : undefined}
                isActive={
                  phaseType === 'agendaitems'
                    ? localPhaseType !== '' && blackList.includes(localPhaseType)
                    : localPhaseType === phaseType
                }
                isCollapsible={collapsiblePhases.includes(phaseType)}
                isFacilitatorPhase={phaseType === facilitatorPhaseType}
                isUnsyncedFacilitatorPhase={
                  isUnsyncedFacilitatorPhase && phaseType === facilitatorPhaseType
                }
                isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
                key={phaseType}
                phaseCount={phaseCount}
                phaseType={phaseType}
              >
                <ActionSidebarPhaseListItemChildren
                  gotoStageId={gotoStageId}
                  handleMenuClick={handleMenuClick}
                  phaseType={phaseType}
                  maxChildHeight={maxChildHeight}
                  meeting={meeting}
                />
              </NewMeetingSidebarPhaseListItem>
            )
          })}
      </MeetingNavList>
    </NewMeetingSidebar>
  )
}

export default createFragmentContainer(ActionMeetingSidebar, {
  meeting: graphql`
    fragment ActionMeetingSidebar_meeting on ActionMeeting {
      ...ActionSidebarPhaseListItemChildren_meeting
      ...NewMeetingSidebar_meeting
      settings {
        phaseTypes
      }
      facilitatorUserId
      facilitatorStageId
      localPhase {
        phaseType
      }
      localStage {
        id
      }
      phases {
        phaseType
        stages {
          id
          isComplete
          isNavigable
          isNavigableByFacilitator
        }
      }
      team {
        agendaItems {
          id
        }
      }
    }
  `
})
