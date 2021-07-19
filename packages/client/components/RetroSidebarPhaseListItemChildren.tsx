import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'
import RetroSidebarDiscussSection from './RetroSidebarDiscussSection'
import isPhaseComplete from '../utils/meetings/isPhaseComplete'
import useGotoStageId from '~/hooks/useGotoStageId'
import {
  NewMeetingPhaseTypeEnum,
  RetroSidebarPhaseListItemChildren_meeting
} from '~/__generated__/RetroSidebarPhaseListItemChildren_meeting.graphql'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: NewMeetingPhaseTypeEnum
  maxChildHeight: number | null
  meeting: RetroSidebarPhaseListItemChildren_meeting
}

const RetroSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, maxChildHeight, meeting} = props
  const {phases} = meeting
  const showDiscussSection = phases && isPhaseComplete('vote', phases)
  if (phaseType === 'discuss' && showDiscussSection) {
    return (
      <RetroSidebarDiscussSection
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

export default createFragmentContainer(RetroSidebarPhaseListItemChildren, {
  meeting: graphql`
    fragment RetroSidebarPhaseListItemChildren_meeting on RetrospectiveMeeting {
      ...MeetingSidebarTeamMemberStageItems_meeting
      ...RetroSidebarDiscussSection_meeting
      phases {
        phaseType
        stages {
          isComplete
        }
      }
    }
  `
})
