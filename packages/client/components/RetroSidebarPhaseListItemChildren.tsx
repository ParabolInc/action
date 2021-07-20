import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'
import RetroSidebarDiscussSection from './RetroSidebarDiscussSection'
import useGotoStageId from '~/hooks/useGotoStageId'
import {
  NewMeetingPhaseTypeEnum,
  RetroSidebarPhaseListItemChildren_meeting
} from '~/__generated__/RetroSidebarPhaseListItemChildren_meeting.graphql'
import {NavSidebar} from '../types/constEnums'
import isPhaseComplete from '../utils/meetings/isPhaseComplete'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: NewMeetingPhaseTypeEnum
  maxSidebarChildrenHeight: number
  meeting: RetroSidebarPhaseListItemChildren_meeting
}

const RetroSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, meeting, maxSidebarChildrenHeight} = props
  const {phases, localPhase} = meeting
  const {phaseType: localPhaseType} = localPhase
  const discussPhase = phases.find(({phaseType}) => phaseType === 'discuss')
  const isDiscussPhaseActive = phases && isPhaseComplete('vote', phases)
  const checkinStages = phases.find((stage) => stage.phaseType === 'checkin')?.stages
  const checkinStagesCount = checkinStages?.length || 0
  const checkinMaxHeight = checkinStagesCount * NavSidebar.ITEM_HEIGHT
  const maxInactiveDiscussHeight = maxSidebarChildrenHeight - checkinMaxHeight
  const maxDiscussHeight =
    localPhaseType === 'discuss' ? maxSidebarChildrenHeight : maxInactiveDiscussHeight

  if (discussPhase && phaseType === 'discuss') {
    return (
      <RetroSidebarDiscussSection
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
        maxDiscussHeight={maxDiscussHeight}
        isDiscussPhaseActive={isDiscussPhaseActive}
      />
    )
  }
  if (phaseType === 'checkin') {
    return (
      <MeetingSidebarTeamMemberStageItems
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
        phaseType={phaseType}
        maxSidebarChildrenHeight={maxSidebarChildrenHeight}
      />
    )
  }
  return null
}

export default createFragmentContainer(RetroSidebarPhaseListItemChildren, {
  meeting: graphql`
    fragment RetroSidebarPhaseListItemChildren_meeting on RetrospectiveMeeting {
      ...MeetingSidebarTeamMemberStageItems_meeting
      ...RetroSidebarDiscussSection_meeting
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
