import * as Sentry from '@sentry/browser'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MeetingSidebarTeamMemberStageItems_meeting} from '~/__generated__/MeetingSidebarTeamMemberStageItems_meeting.graphql'
import Avatar from '../components/Avatar/Avatar'
import MeetingSubnavItem from '../components/MeetingSubnavItem'
import useAtmosphere from '../hooks/useAtmosphere'
import useGotoStageId from '../hooks/useGotoStageId'
import MeetingSidebarPhaseItemChild from './MeetingSidebarPhaseItemChild'
import {NewMeetingPhaseTypeEnum} from '../__generated__/DraggableReflectionCard_meeting.graphql'
import {NavSidebar} from '../types/constEnums'

const AvatarBlock = styled('div')({
  width: 32
})

const ScrollStageItems = styled('div')<{
  showScrollbar: boolean
}>(({showScrollbar}) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%', // trickle down height for overflow
  // react-beautiful-dnd supports scrolling on 1 parent
  // this is where we need it, in order to scroll a long list
  overflow: showScrollbar ? 'auto' : 'hidden',
  paddingRight: 8,
  width: '100%'
}))

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  meeting: MeetingSidebarTeamMemberStageItems_meeting
  phaseType: NewMeetingPhaseTypeEnum
  maxSidebarChildrenHeight: number
}

const MeetingSidebarTeamMemberStageItems = (props: Props) => {
  const {gotoStageId, handleMenuClick, meeting, phaseType, maxSidebarChildrenHeight} = props
  const {
    id: meetingId,
    facilitatorStageId,
    facilitatorUserId,
    localPhase,
    localStage,
    phases
  } = meeting
  const {phaseType: localPhaseType} = localPhase
  const localStageId = (localStage && localStage.id) || ''
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isActivePhase = phaseType === localPhaseType
  const isViewerFacilitator = viewerId === facilitatorUserId
  const stages = phases.find((stage) => stage.phaseType === phaseType)?.stages
  const stagesCount = stages?.length || 0
  const maxHeight = NavSidebar.ITEM_HEIGHT * stagesCount
  const childHeight = isActivePhase ? Math.min(maxSidebarChildrenHeight, maxHeight) : 0
  const showScrollbar = maxHeight > maxSidebarChildrenHeight
  const gotoStage = (teamMemberId) => () => {
    const teamMemberStage = stages?.find((stage) => stage.teamMemberId === teamMemberId)
    const teamMemberStageId = (teamMemberStage && teamMemberStage.id) || ''
    gotoStageId(teamMemberStageId).catch()
    handleMenuClick()
  }

  return (
    <MeetingSidebarPhaseItemChild height={childHeight}>
      <ScrollStageItems showScrollbar={showScrollbar}>
        {stages!.map((stage) => {
          const {
            id: stageId,
            isComplete,
            teamMemberId,
            teamMember,
            isNavigableByFacilitator,
            isNavigable
          } = stage
          if (!teamMember) {
            Sentry.captureException(
              new Error(
                `Team member is undefined. teamMemberId is ${teamMemberId}. phaseType is ${localPhaseType}. stageId is ${stageId}. meetingId is ${meetingId}. localStageId is ${localStageId}. stage is ${JSON.stringify(
                  stage
                )}.`
              )
            )
            return null
          }
          const {picture, preferredName} = teamMember
          const isLocalStage = localStageId === stageId
          const isFacilitatorStage = facilitatorStageId === stageId
          const isUnsyncedFacilitatorStage = isFacilitatorStage !== isLocalStage && !isLocalStage
          return (
            <MeetingSubnavItem
              key={stageId}
              metaContent={
                <AvatarBlock>
                  <Avatar hasBadge={false} picture={picture} size={24} />
                </AvatarBlock>
              }
              isDisabled={isViewerFacilitator ? !isNavigableByFacilitator : !isNavigable}
              onClick={gotoStage(teamMemberId)}
              isActive={isActivePhase && localStageId === stageId}
              isComplete={isComplete}
              isDragging={false}
              isUnsyncedFacilitatorStage={isUnsyncedFacilitatorStage}
            >
              {preferredName}
            </MeetingSubnavItem>
          )
        })}
      </ScrollStageItems>
    </MeetingSidebarPhaseItemChild>
  )
}

graphql`
  fragment MeetingSidebarTeamMemberStageItems_phase on NewMeetingPhase {
    id
    phaseType
    stages {
      id
      isComplete
      isComplete
      isNavigable
      isNavigableByFacilitator
      ... on NewMeetingTeamMemberStage {
        teamMemberId
        teamMember {
          picture
          preferredName
        }
      }
    }
  }
`

export default createFragmentContainer(MeetingSidebarTeamMemberStageItems, {
  meeting: graphql`
    fragment MeetingSidebarTeamMemberStageItems_meeting on NewMeeting {
      facilitatorStageId
      facilitatorUserId
      id
      localPhase {
        ...MeetingSidebarTeamMemberStageItems_phase @relay(mask: false)
      }
      localStage {
        id
      }
      phases {
        ...MeetingSidebarTeamMemberStageItems_phase @relay(mask: false)
      }
    }
  `
})
