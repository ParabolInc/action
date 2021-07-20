import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useGotoStageId from '~/hooks/useGotoStageId'
import {
  NewMeetingPhaseTypeEnum,
  PokerSidebarPhaseListItemChildren_meeting
} from '~/__generated__/PokerSidebarPhaseListItemChildren_meeting.graphql'
import {NavSidebar} from '../types/constEnums'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'
import PokerSidebarEstimateSection from './PokerSidebarEstimateSection'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: NewMeetingPhaseTypeEnum
  maxSidebarChildrenHeight: number
  meeting: PokerSidebarPhaseListItemChildren_meeting
}

const PokerSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, maxSidebarChildrenHeight, meeting} = props
  const {localPhase, phases} = meeting
  const {phaseType: localPhaseType} = localPhase
  const checkinStages = phases.find((stage) => stage.phaseType === 'checkin')?.stages
  const checkinStagesCount = checkinStages?.length || 0
  const checkinMaxHeight = checkinStagesCount * NavSidebar.ITEM_HEIGHT
  const maxInactiveEstimateHeight = maxSidebarChildrenHeight - checkinMaxHeight
  const maxEstimateHeight =
    localPhaseType === 'ESTIMATE' ? maxSidebarChildrenHeight : maxInactiveEstimateHeight
  if (phaseType === 'ESTIMATE') {
    return (
      <PokerSidebarEstimateSection
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
        maxEstimateHeight={maxEstimateHeight}
      />
    )
  }
  if (phaseType === 'checkin') {
    return (
      <MeetingSidebarTeamMemberStageItems
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
        maxSidebarChildrenHeight={maxSidebarChildrenHeight}
        phaseType={phaseType}
      />
    )
  }
  return null
}

export default createFragmentContainer(PokerSidebarPhaseListItemChildren, {
  meeting: graphql`
    fragment PokerSidebarPhaseListItemChildren_meeting on PokerMeeting {
      ...MeetingSidebarTeamMemberStageItems_meeting
      ...PokerSidebarEstimateSection_meeting
      localPhase {
        phaseType
      }
      phases {
        phaseType
        stages {
          isComplete
        }
      }
    }
  `
})
