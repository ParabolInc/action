import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useMutationProps from '~/hooks/useMutationProps'
import useAtmosphere from '../hooks/useAtmosphere'
import useIsInitializing from '../hooks/useIsInitializing'
import useIsPokerVotingClosing from '../hooks/useIsPokerVotingClosing'
import PokerResetDimensionMutation from '../mutations/PokerResetDimensionMutation'
import SetPokerSpectateMutation from '../mutations/SetPokerSpectateMutation'
import {PALETTE} from '../styles/paletteV3'
import {EstimateDimensionColumn_meeting} from '../__generated__/EstimateDimensionColumn_meeting.graphql'
import {EstimateDimensionColumn_stage} from '../__generated__/EstimateDimensionColumn_stage.graphql'
import DeckActivityAvatars from './DeckActivityAvatars'
import LinkButton from './LinkButton'
import PokerActiveVoting from './PokerActiveVoting'
import PokerDiscussVoting from './PokerDiscussVoting'

const ColumnInner = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  width: '100%'
})

const DimensionHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: '8px 16px'
})

const DimensionName = styled('div')({
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px',
  marginRight: 'auto'
})

const StyledLinkButton = styled(LinkButton)({
  fontSize: 12,
  fontWeight: 600
})

const StyledError = styled('div')({
  color: PALETTE.TOMATO_500,
  fontSize: 12,
  fontWeight: 600,
  paddingRight: 16
})

interface Props {
  stage: EstimateDimensionColumn_stage
  meeting: EstimateDimensionColumn_meeting
}

const EstimateDimensionColumn = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {meeting, stage} = props
  const {endedAt, facilitatorUserId, id: meetingId, viewerMeetingMember} = meeting
  const isSpectating = viewerMeetingMember?.isSpectating
  const isFacilitator = viewerId === facilitatorUserId
  const {id: stageId, dimensionRef} = stage
  const {name} = dimensionRef
  const {isVoting} = stage
  const {onError, onCompleted, submitMutation, error, submitting} = useMutationProps()
  const isClosing = useIsPokerVotingClosing(isVoting, stageId)
  const isInitialStageRender = useIsInitializing()
  const reset = () => {
    if (submitting) return
    submitMutation()
    PokerResetDimensionMutation(atmosphere, {meetingId, stageId}, {onError, onCompleted})
  }
  const setSpectating = (isSpectating: boolean) => () => {
    if (submitting) return
    submitMutation()
    SetPokerSpectateMutation(atmosphere, {meetingId, isSpectating}, {onError, onCompleted})
  }
  const showVoting = isVoting || isClosing
  return (
    <ColumnInner>
      <DimensionHeader>
        <DimensionName>{name}</DimensionName>
        {error && <StyledError>{error.message}</StyledError>}
        {!isVoting && isFacilitator && !endedAt && (
          <StyledLinkButton onClick={reset} palette={'blue'}>
            {'Team Revote'}
          </StyledLinkButton>
        )}
        {isVoting && !endedAt && isSpectating && (
          <StyledLinkButton onClick={setSpectating(false)} palette={'blue'}>
            {'Let me vote!'}
          </StyledLinkButton>
        )}
        {isVoting && !endedAt && !isSpectating && (
          <StyledLinkButton onClick={setSpectating(true)} palette={'blue'}>
            {'I don’t vote'}
          </StyledLinkButton>
        )}
      </DimensionHeader>
      <DeckActivityAvatars stage={stage} />
      {showVoting ? (
        <PokerActiveVoting
          meeting={meeting}
          stage={stage}
          isClosing={isClosing}
          isInitialStageRender={isInitialStageRender}
        />
      ) : (
        <PokerDiscussVoting
          meeting={meeting}
          stage={stage}
          isInitialStageRender={isInitialStageRender}
        />
      )}
    </ColumnInner>
  )
}

export default createFragmentContainer(EstimateDimensionColumn, {
  stage: graphql`
    fragment EstimateDimensionColumn_stage on EstimateStage {
      ...PokerActiveVoting_stage
      ...PokerDiscussVoting_stage
      ...DeckActivityAvatars_stage
      id
      isVoting
      dimensionRef {
        name
      }
    }
  `,
  meeting: graphql`
    fragment EstimateDimensionColumn_meeting on PokerMeeting {
      ...PokerActiveVoting_meeting
      ...PokerDiscussVoting_meeting
      facilitatorUserId
      id
      endedAt
      viewerMeetingMember {
        isSpectating
      }
    }
  `
})
