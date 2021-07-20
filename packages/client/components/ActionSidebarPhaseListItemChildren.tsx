import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import ActionSidebarAgendaItemsSection from './ActionSidebarAgendaItemsSection'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'
import {NewMeetingPhaseTypeEnum} from '../__generated__/ActionSidebarAgendaItemsSection_meeting.graphql'
import {ActionSidebarPhaseListItemChildren_meeting} from '~/__generated__/ActionSidebarPhaseListItemChildren_meeting.graphql'
import useGotoStageId from '../hooks/useGotoStageId'
import {NavSidebar} from '../types/constEnums'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: NewMeetingPhaseTypeEnum
  meeting: ActionSidebarPhaseListItemChildren_meeting
  maxSidebarChildrenHeight: number
}
const agendaPhases: NewMeetingPhaseTypeEnum[] = ['firstcall', 'agendaitems', 'lastcall']

const ActionSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, meeting, maxSidebarChildrenHeight} = props
  const {localPhase, phases} = meeting
  const {phaseType: localPhaseType} = localPhase
  const stages = phases.find((stage) => stage.phaseType === localPhaseType)?.stages
  const stagesCount = stages?.length || 0
  const memberStageMaxHeight = stagesCount * NavSidebar.ITEM_HEIGHT
  const maxInactiveAgendaItemsHeight = Math.max(
    maxSidebarChildrenHeight - memberStageMaxHeight,
    NavSidebar.AGENDA_ITEM_INPUT_HEIGHT
  )
  const maxAgendaItemsHeight = agendaPhases.includes(localPhaseType)
    ? maxSidebarChildrenHeight
    : maxInactiveAgendaItemsHeight
  if (agendaPhases.includes(phaseType)) {
    return (
      <ActionSidebarAgendaItemsSection
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        maxAgendaItemsHeight={maxAgendaItemsHeight}
        meeting={meeting}
      />
    )
  }
  return (
    <MeetingSidebarTeamMemberStageItems
      gotoStageId={gotoStageId}
      handleMenuClick={handleMenuClick}
      maxSidebarChildrenHeight={maxSidebarChildrenHeight}
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
      phases {
        phaseType
        stages {
          id
          phaseType
        }
      }
      ...ActionSidebarAgendaItemsSection_meeting
    }
  `
})
