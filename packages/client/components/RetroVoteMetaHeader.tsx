import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import lazyPreload from '~/utils/lazyPreload'
import {RetroVoteMetaHeader_meeting} from '~/__generated__/RetroVoteMetaHeader_meeting.graphql'
import {PALETTE} from '../styles/paletteV3'
import {FONT_FAMILY, ICON_SIZE} from '../styles/typographyV2'
import {Breakpoint} from '../types/constEnums'
import Icon from './Icon'
import LabelHeading from './LabelHeading/LabelHeading'

const VoteSettingsMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'VoteSettingsMenu' */
    './VoteSettingsMenu'
  )
)

const VoteMeta = styled('div')({
  alignItems: 'center',
  borderBottom: `.0625rem solid ${PALETTE.SLATE_400}`,
  display: 'flex',
  justifyContent: 'center',
  margin: '0 auto 8px',
  padding: 8,
  width: '100%',
  [`@media screen and (min-width: ${Breakpoint.VOTE_PHASE}px)`]: {
    margin: '0 auto 16px',
    padding: '0 0 8px'
  }
})

const FirstVoteMetaBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'nowrap',
  userSelect: 'none'
})

const FollowingVoteMetaBlock = styled(FirstVoteMetaBlock)({
  marginLeft: 24,
  [`@media screen and (min-width: ${Breakpoint.VOTE_PHASE}px)`]: {
    marginLeft: 32
  }
})

const FacilitatorVoteBlock = styled(FollowingVoteMetaBlock)({
  cursor: 'pointer'
})

const VoteLabelHeading = styled(LabelHeading)({
  fontSize: 12,
  textTransform: 'none',
  whiteSpace: 'nowrap',
  [`@media screen and (min-width: ${Breakpoint.VOTE_PHASE}px)`]: {
    paddingTop: 2
  }
})

const VoteCountLabel = styled('div')({
  color: PALETTE.SKY_500,
  fontFamily: FONT_FAMILY.MONOSPACE,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  marginLeft: 8,
  padding: 0,
  [`@media screen and (min-width: ${Breakpoint.VOTE_PHASE}px)`]: {
    fontSize: 16,
    marginLeft: 12
  }
})

const FacilitatorLabel = styled(VoteLabelHeading)({
  color: PALETTE.SLATE_800
})

const FacilitatorDropdownIcon = styled(Icon)({
  color: PALETTE.SLATE_800,
  fontSize: ICON_SIZE.MD24
})

const TeamVotesCountLabel = styled(VoteCountLabel)({
  // most likely will start out with 2 digits
  // min-width reduces change in layout
  minWidth: 20
})

interface Props {
  meeting: RetroVoteMetaHeader_meeting
}

const RetroVoteMetaHeader = (props: Props) => {
  const {meeting} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {viewerMeetingMember, endedAt, facilitatorUserId} = meeting
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT
  )
  const teamVotesRemaining = meeting.votesRemaining || 0
  const myVotesRemaining = viewerMeetingMember?.votesRemaining || 0
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  return (
    <VoteMeta>
      <FirstVoteMetaBlock>
        <VoteLabelHeading>{'My Votes'}</VoteLabelHeading>
        <VoteCountLabel data-cy={'my-votes-remaining'}>{myVotesRemaining}</VoteCountLabel>
      </FirstVoteMetaBlock>
      <FollowingVoteMetaBlock>
        <VoteLabelHeading>{'Team Votes'}</VoteLabelHeading>
        <TeamVotesCountLabel data-cy={'team-votes-remaining'}>
          {teamVotesRemaining}
        </TeamVotesCountLabel>
      </FollowingVoteMetaBlock>
      {isFacilitating && (
        <>
          <FacilitatorVoteBlock
            ref={originRef}
            onClick={togglePortal}
            onMouseEnter={VoteSettingsMenu.preload}
          >
            <FacilitatorLabel>{'Vote Settings'}</FacilitatorLabel>
            <FacilitatorDropdownIcon>{'expand_more'}</FacilitatorDropdownIcon>
          </FacilitatorVoteBlock>
          {menuPortal(<VoteSettingsMenu meeting={meeting} menuProps={menuProps} />)}
        </>
      )}
    </VoteMeta>
  )
}

export default createFragmentContainer(RetroVoteMetaHeader, {
  meeting: graphql`
    fragment RetroVoteMetaHeader_meeting on RetrospectiveMeeting {
      ...VoteSettingsMenu_meeting
      endedAt
      facilitatorUserId
      viewerMeetingMember {
        votesRemaining
      }
      votesRemaining
    }
  `
})
