import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import ActionSidebarAgendaItemsSection from './ActionSidebarAgendaItemsSection'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'
import {NewMeetingPhaseTypeEnum} from '../__generated__/ActionSidebarAgendaItemsSection_meeting.graphql'
import {ActionSidebarPhaseListItemChildren_meeting} from '~/__generated__/ActionSidebarPhaseListItemChildren_meeting.graphql'
import useGotoStageId from '../hooks/useGotoStageId'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: NewMeetingPhaseTypeEnum | string
  meeting: ActionSidebarPhaseListItemChildren_meeting
}

const ActionSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, meeting} = props
  if (phaseType === 'agendaitems') {
    return (
      <ActionSidebarAgendaItemsSection
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
      />
    )
  } else if (meeting.localPhase && meeting.localPhase.phaseType === phaseType) {
    return (
      <MeetingSidebarTeamMemberStageItems
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
      />
    )
  }
  return null
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
