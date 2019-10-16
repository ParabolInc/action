import {RetroGroupPhase_team} from '../__generated__/RetroGroupPhase_team.graphql'
import ms from 'ms'
/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 */
import React, {useRef} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import MeetingContent from './MeetingContent'
import MeetingTopBar from './MeetingTopBar'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingHelpToggle from './MenuHelpToggle'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import {RetroMeetingPhaseProps} from './RetroMeeting'
import useTimeoutWithReset from '../hooks/useTimeoutWithReset'
import MeetingFacilitatorBar from '../modules/meeting/components/MeetingControlBar/MeetingFacilitatorBar'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import {VOTE} from '../utils/constants'
import lazyPreload from '../utils/lazyPreload'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import handleRightArrow from '../utils/handleRightArrow'
import isDemoRoute from '../utils/isDemoRoute'
import EndMeetingButton from './EndMeetingButton'
import StageTimerDisplay from './RetroReflectPhase/StageTimerDisplay'
import StageTimerControl from './StageTimerControl'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import PhaseWrapper from './PhaseWrapper'
import {ElementWidth} from '../types/constEnums'
import GroupingKanban from './GroupingKanban'
import useAtmosphere from '../hooks/useAtmosphere'

interface Props extends RetroMeetingPhaseProps {
  team: RetroGroupPhase_team
}

const CenteredControlBlock = styled('div')<{isComplete: boolean | undefined}>(({isComplete}) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'space-evenly',
  marginLeft: isComplete ? ElementWidth.END_MEETING_BUTTON : undefined
}))

const GroupHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'GroupHelpMenu' */ './MeetingHelp/GroupHelpMenu')
)
const DemoGroupHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'DemoGroupHelpMenu' */ './MeetingHelp/DemoGroupHelpMenu')
)

const RetroGroupPhase = (props: Props) => {
  const atmosphere = useAtmosphere()
  const phaseRef = useRef<HTMLDivElement>(null)
  // const {onCompleted, submitMutation, error, onError, submitting} = useMutationProps()
  const [isReadyToVote, resetActivityTimeout] = useTimeoutWithReset(ms('1m'), ms('30s'))
  const {avatarGroup, toggleSidebar, handleGotoNext, team, isDemoStageComplete} = props
  const {viewerId} = atmosphere
  const {isMeetingSidebarCollapsed, newMeeting} = team
  if (!newMeeting) return null
  const {facilitatorUserId, id: meetingId, localStage} = newMeeting
  const isComplete = localStage ? localStage.isComplete : false
  const isAsync = localStage ? localStage.isAsync : false
  const isFacilitating = facilitatorUserId === viewerId
  const nextPhaseLabel = phaseLabelLookup[VOTE]
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  // const autoGroup = () => {
  //   if (submitting) return
  //   submitMutation()
  //   const groupingThreshold = nextAutoGroupThreshold || 0.5
  //   AutoGroupReflectionsMutation(atmosphere, {meetingId, groupingThreshold}, onError, onCompleted)
  // }
  // const canAutoGroup = !isDemoRoute() && (!nextAutoGroupThreshold || nextAutoGroupThreshold < 1) && !isComplete
  return (
    <MeetingContent ref={phaseRef}>
      <MeetingHeaderAndPhase>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup[NewMeetingPhaseTypeEnum.group]}</PhaseHeaderTitle>
          <PhaseHeaderDescription>{'Drag cards to group by common topics'}</PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay stage={localStage!} />
          {/*{error && <StyledError>{error}</StyledError>}*/}
          <MeetingPhaseWrapper>
            <GroupingKanban
              meeting={newMeeting}
              phaseRef={phaseRef}
              resetActivityTimeout={resetActivityTimeout}
            />
          </MeetingPhaseWrapper>
        </PhaseWrapper>
        <MeetingHelpToggle menu={isDemoRoute() ? <DemoGroupHelpMenu /> : <GroupHelpMenu />} />
      </MeetingHeaderAndPhase>
      <MeetingFacilitatorBar isFacilitating={isFacilitating}>
        {!isComplete && (
          <StageTimerControl defaultTimeLimit={5} meetingId={meetingId} team={team} />
        )}
        <CenteredControlBlock isComplete={isComplete}>
          {/*{canAutoGroup && (*/}
          {/*  <BottomNavControl onClick={autoGroup} waiting={submitting}>*/}
          {/*    <BottomNavIconLabel*/}
          {/*      icon='photo_filter'*/}
          {/*      iconColor='midGray'*/}
          {/*      label={'Auto Group'}*/}
          {/*    />*/}
          {/*  </BottomNavControl>*/}
          {/*)}*/}
          <BottomNavControl
            isBouncing={isDemoStageComplete || (!isAsync && !isComplete && isReadyToVote)}
            disabled={isDemoRoute() && !isDemoStageComplete}
            onClick={() => gotoNext()}
            onKeyDown={handleRightArrow(() => gotoNext())}
            ref={gotoNextRef}
          >
            <BottomNavIconLabel
              icon='arrow_forward'
              iconColor='warm'
              label={`Next: ${nextPhaseLabel}`}
            />
          </BottomNavControl>
        </CenteredControlBlock>
        <EndMeetingButton meetingId={meetingId} />
      </MeetingFacilitatorBar>
    </MeetingContent>
  )
}

graphql`
  fragment RetroGroupPhase_stage on GenericMeetingStage {
    ...StageTimerDisplay_stage
    isAsync
    isComplete
  }
`

export default createFragmentContainer(RetroGroupPhase, {
  team: graphql`
    fragment RetroGroupPhase_team on Team {
      ...StageTimerControl_team
      isMeetingSidebarCollapsed
      newMeeting {
        id
        facilitatorUserId
        ... on RetrospectiveMeeting {
          ...GroupingKanban_meeting
          localStage {
            ...RetroGroupPhase_stage @relay(mask: false)
          }
          phases {
            stages {
              ...RetroGroupPhase_stage @relay(mask: false)
            }
          }
          nextAutoGroupThreshold
        }
      }
    }
  `
})
