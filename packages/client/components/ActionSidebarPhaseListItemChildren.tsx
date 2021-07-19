import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ActionSidebarPhaseListItemChildren_meeting} from '~/__generated__/ActionSidebarPhaseListItemChildren_meeting.graphql'
import useGotoStageId from '../hooks/useGotoStageId'
import {NewMeetingPhaseTypeEnum} from '../__generated__/ActionSidebarAgendaItemsSection_meeting.graphql'
import ActionSidebarAgendaItemsSection from './ActionSidebarAgendaItemsSection'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: NewMeetingPhaseTypeEnum
  maxChildHeight: number | null
  meeting: ActionSidebarPhaseListItemChildren_meeting
}

const ActionSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, maxChildHeight, meeting} = props
  if (phaseType === 'agendaitems') {
    return (
      <ActionSidebarAgendaItemsSection
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
      />
    )
  }
  return (
    <MeetingSidebarTeamMemberStageItems
      gotoStageId={gotoStageId}
      handleMenuClick={handleMenuClick}
      maxChildHeight={maxChildHeight}
      meeting={meeting}
      phaseType={phaseType}
    />
  )
}

export default createFragmentContainer(ActionSidebarPhaseListItemChildren, {
  meeting: graphql`
    fragment ActionSidebarPhaseListItemChildren_meeting on ActionMeeting {
      ...MeetingSidebarTeamMemberStageItems_meeting
      localPhase {
        phaseType
      }
      ...ActionSidebarAgendaItemsSection_meeting
    }
  `
})
