import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useGotoStageId from '~/hooks/useGotoStageId'
import {
  NewMeetingPhaseTypeEnum,
  PokerSidebarPhaseListItemChildren_meeting
} from '~/__generated__/PokerSidebarPhaseListItemChildren_meeting.graphql'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'
import PokerSidebarEstimateSection from './PokerSidebarEstimateSection'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: NewMeetingPhaseTypeEnum
  meeting: PokerSidebarPhaseListItemChildren_meeting
}

const PokerSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, meeting} = props
  const {localPhase} = meeting
  const showCheckInSection = localPhase && localPhase.phaseType === phaseType
  if (phaseType === 'checkin' && showCheckInSection) {
    return (
      <MeetingSidebarTeamMemberStageItems
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
      />
    )
  }
  if (phaseType === 'ESTIMATE') {
    return (
      <PokerSidebarEstimateSection
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
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
