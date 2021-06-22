import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import {
  NewMeetingPhaseTypeEnum,
  PokerMeetingSidebar_meeting
} from '~/__generated__/PokerMeetingSidebar_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useGotoStageId from '../hooks/useGotoStageId'
import getSidebarItemStage from '../utils/getSidebarItemStage'
import findStageById from '../utils/meetings/findStageById'
import MeetingNavList from './MeetingNavList'
import NewMeetingSidebar from './NewMeetingSidebar'
import NewMeetingSidebarPhaseListItem from './NewMeetingSidebarPhaseListItem'
import PokerSidebarPhaseListItemChildren from './PokerSidebarPhaseListItemChildren'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  toggleSidebar: () => void
  meeting: PokerMeetingSidebar_meeting
}

const collapsiblePhases: NewMeetingPhaseTypeEnum[] = ['checkin', 'ESTIMATE']

const PokerMeetingSidebar = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {viewerId} = atmosphere
  const {gotoStageId, handleMenuClick, toggleSidebar, meeting} = props
  const {
    id: meetingId,
    endedAt,
    facilitatorUserId,
    facilitatorStageId,
    localPhase,
    localStage,
    phases,
    settings
  } = meeting
  const {phaseTypes} = settings
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
    >
      <MeetingNavList>
        {phaseTypes.map((phaseType) => {
          const itemStage = getSidebarItemStage(phaseType, phases, facilitatorStageId)
          const {id: itemStageId = '', isNavigable = false, isNavigableByFacilitator = false} =
            itemStage || {}
          const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
          const handleClick = () => {
            gotoStageId(itemStageId).catch()
            handleMenuClick()
          }
          const estimatePhase = phases.find((phase) => {
            return phase.phaseType === 'ESTIMATE'
          })!
          const phaseCount =
            phaseType === 'ESTIMATE'
              ? new Set(estimatePhase.stages.map(({serviceTaskId}) => serviceTaskId)).size
              : undefined
          return (
            <NewMeetingSidebarPhaseListItem
              handleClick={canNavigate ? handleClick : undefined}
              isActive={phaseType === 'ESTIMATE' ? false : localPhaseType === phaseType}
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
              <PokerSidebarPhaseListItemChildren
                gotoStageId={gotoStageId}
                handleMenuClick={handleMenuClick}
                phaseType={phaseType}
                meeting={meeting}
              />
            </NewMeetingSidebarPhaseListItem>
          )
        })}
        {endedAt && (
          <NewMeetingSidebarPhaseListItem
            key='summary'
            isActive={false}
            isFacilitatorPhase={false}
            isUnsyncedFacilitatorPhase={false}
            handleClick={() => {
              history.push(`/new-summary/${meetingId}`)
            }}
            phaseType='SUMMARY'
          />
        )}
      </MeetingNavList>
    </NewMeetingSidebar>
  )
}

export default createFragmentContainer(PokerMeetingSidebar, {
  meeting: graphql`
    fragment PokerMeetingSidebar_meeting on PokerMeeting {
      ...PokerSidebarPhaseListItemChildren_meeting
      ...NewMeetingSidebar_meeting
      showSidebar
      settings {
        phaseTypes
      }
      id
      endedAt
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
          ... on EstimateStage {
            serviceTaskId
          }
        }
      }
    }
  `
})
