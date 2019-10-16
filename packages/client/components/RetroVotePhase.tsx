import {RetroVotePhase_team} from '../__generated__/RetroVotePhase_team.graphql'
import React, {useRef} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import Icon from './Icon'
import LabelHeading from './LabelHeading/LabelHeading'
import MeetingContent from './MeetingContent'
import MeetingTopBar from './MeetingTopBar'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingHelpToggle from './MenuHelpToggle'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import {RetroMeetingPhaseProps} from './RetroMeeting'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import MeetingFacilitatorBar from '../modules/meeting/components/MeetingControlBar/MeetingFacilitatorBar'
import {minWidthMediaQueries} from '../styles/breakpoints'
import {meetingVoteIcon} from '../styles/meeting'
import {PALETTE} from '../styles/paletteV2'
import {FONT_FAMILY, ICON_SIZE} from '../styles/typographyV2'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import {DISCUSS} from '../utils/constants'
import lazyPreload from '../utils/lazyPreload'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import handleRightArrow from '../utils/handleRightArrow'
import isDemoRoute from '../utils/isDemoRoute'
import EndMeetingButton from './EndMeetingButton'
import {RetroVotePhase_meetingSettings} from '../__generated__/RetroVotePhase_meetingSettings.graphql'
import StageTimerControl from './StageTimerControl'
import StageTimerDisplay from './RetroReflectPhase/StageTimerDisplay'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import PhaseWrapper from './PhaseWrapper'
import {ElementWidth} from '../types/constEnums'
import GroupingKanban from './GroupingKanban'

interface Props extends WithAtmosphereProps, RetroMeetingPhaseProps {
  meetingSettings: RetroVotePhase_meetingSettings
  team: RetroVotePhase_team
}

const CenterControlBlock = styled('div')<{isComplete: boolean}>(({isComplete}) => ({
  margin: '0 auto',
  paddingLeft: isComplete ? ElementWidth.END_MEETING_BUTTON : undefined
}))

const votePhaseBreakpoint = minWidthMediaQueries[1]

const VoteMeta = styled('div')({
  alignItems: 'center',
  borderBottom: `.0625rem solid ${PALETTE.BORDER_LIGHT}`,
  display: 'flex',
  justifyContent: 'center',
  margin: '0 auto 1rem',
  padding: '.5rem .5rem',
  width: '100%',
  [votePhaseBreakpoint]: {
    padding: '0 0 .5rem'
  }
})

const MetaBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'nowrap',
  userSelect: 'none'
})

const StyledMetaBlock = styled(MetaBlock)({
  marginRight: '1.5rem',
  [votePhaseBreakpoint]: {
    marginRight: '2rem'
  }
})

const Label = styled(LabelHeading)({
  fontSize: 11,
  marginRight: '.5rem',
  whiteSpace: 'nowrap',
  [votePhaseBreakpoint]: {
    fontSize: 12,
    marginRight: '.75rem',
    paddingTop: '.125rem'
  }
})

const CheckIcon = styled(Icon)<{isDark: boolean | undefined | null}>(({isDark}) => ({
  color: PALETTE.EMPHASIS_COOL,
  display: 'block',
  fontSize: ICON_SIZE.MD18,
  opacity: isDark ? 1 : 0.2,
  marginRight: '.25rem'
}))

const CheckMarkRow = styled('div')({
  display: 'none',
  [votePhaseBreakpoint]: {
    display: 'flex'
  }
})

const VoteCountLabel = styled('div')({
  color: PALETTE.EMPHASIS_COOL,
  fontFamily: FONT_FAMILY.MONOSPACE,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '1.5',
  margin: 0,
  padding: 0,
  [votePhaseBreakpoint]: {
    fontSize: 16
  }
})

const MyVotesCountLabel = styled(VoteCountLabel)({
  [votePhaseBreakpoint]: {
    display: 'none'
  }
})

const TeamVotesCountLabel = styled(VoteCountLabel)({
  // most likely will start out with 2 digits
  // min-width reduces change in layout
  minWidth: '1.25rem'
})

const VoteHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'VoteHelpMenu' */ './MeetingHelp/VoteHelpMenu')
)
const DemoVoteHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'DemoVoteHelpMenu' */ './MeetingHelp/DemoVoteHelpMenu')
)

const RetroVotePhase = (props: Props) => {
  const {
    avatarGroup,
    toggleSidebar,
    meetingSettings: {totalVotes = 0},
    atmosphere: {viewerId},
    handleGotoNext,
    team
  } = props
  const {isMeetingSidebarCollapsed, newMeeting} = team
  const phaseRef = useRef<HTMLDivElement>(null)
  if (!newMeeting) return null
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const {facilitatorUserId, id: meetingId, phases, viewerMeetingMember, localStage} = newMeeting
  const isComplete = localStage ? localStage.isComplete : false
  const teamVotesRemaining = newMeeting.votesRemaining || 0
  const myVotesRemaining = viewerMeetingMember.votesRemaining || 0
  const isFacilitating = facilitatorUserId === viewerId
  const discussPhase = phases.find((phase) => phase.phaseType === DISCUSS)!
  const discussStage = discussPhase.stages![0]
  const nextPhaseLabel = phaseLabelLookup[DISCUSS]
  const checkMarks = [...Array(totalVotes).keys()]
  return (
    <MeetingContent ref={phaseRef}>
      <MeetingHeaderAndPhase>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup[NewMeetingPhaseTypeEnum.vote]}</PhaseHeaderTitle>
          <PhaseHeaderDescription>
            {'Vote on the topics you want to discuss'}
          </PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <VoteMeta>
            <StyledMetaBlock>
              <Label>{'My Votes Remaining'}</Label>
              <MyVotesCountLabel>{myVotesRemaining}</MyVotesCountLabel>
              <CheckMarkRow>
                {checkMarks.map((idx) => (
                  <CheckIcon key={idx} isDark={idx < myVotesRemaining}>
                    {meetingVoteIcon}
                  </CheckIcon>
                ))}
              </CheckMarkRow>
            </StyledMetaBlock>
            <MetaBlock>
              <Label>{'Team Votes Remaining'}</Label>
              <TeamVotesCountLabel>{teamVotesRemaining}</TeamVotesCountLabel>
            </MetaBlock>
          </VoteMeta>
          <StageTimerDisplay stage={localStage} />
          <MeetingPhaseWrapper>
            <GroupingKanban meeting={newMeeting} phaseRef={phaseRef} />
          </MeetingPhaseWrapper>
        </PhaseWrapper>
        <MeetingHelpToggle menu={isDemoRoute() ? <DemoVoteHelpMenu /> : <VoteHelpMenu />} />
      </MeetingHeaderAndPhase>
      <MeetingFacilitatorBar isFacilitating={isFacilitating}>
        {!isComplete && (
          <StageTimerControl defaultTimeLimit={3} meetingId={meetingId} team={team} />
        )}
        <CenterControlBlock isComplete={isComplete}>
          <BottomNavControl
            isBouncing={teamVotesRemaining === 0}
            disabled={!discussStage.isNavigableByFacilitator}
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
        </CenterControlBlock>
        <EndMeetingButton meetingId={meetingId} />
      </MeetingFacilitatorBar>
    </MeetingContent>
  )
}

export default createFragmentContainer(withAtmosphere(RetroVotePhase), {
  meetingSettings: graphql`
    fragment RetroVotePhase_meetingSettings on RetrospectiveMeetingSettings {
      totalVotes
    }
  `,
  team: graphql`
    fragment RetroVotePhase_team on Team {
      ...StageTimerControl_team
      isMeetingSidebarCollapsed
      newMeeting {
        ...GroupingKanban_meeting
        id
        facilitatorUserId
        localStage {
          ...StageTimerDisplay_stage
          isComplete
        }
        phases {
          phaseType
          ... on DiscussPhase {
            stages {
              ...StageTimerDisplay_stage
              ... on RetroDiscussStage {
                id
                isNavigableByFacilitator
              }
            }
          }
        }
        viewerMeetingMember {
          ... on RetrospectiveMeetingMember {
            votesRemaining
          }
        }
        ... on RetrospectiveMeeting {
          votesRemaining
        }
      }
    }
  `
})
