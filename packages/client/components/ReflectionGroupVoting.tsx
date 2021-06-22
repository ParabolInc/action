import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import Atmosphere from '../Atmosphere'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import VoteForReflectionGroupMutation from '../mutations/VoteForReflectionGroupMutation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import getGraphQLError from '../utils/relay/getGraphQLError'
import isTempId from '../utils/relay/isTempId'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import {ReflectionGroupVoting_meeting} from '../__generated__/ReflectionGroupVoting_meeting.graphql'
import {ReflectionGroupVoting_reflectionGroup} from '../__generated__/ReflectionGroupVoting_reflectionGroup.graphql'
import Icon from './Icon'

interface Props extends WithMutationProps, WithAtmosphereProps {
  isExpanded: boolean
  meeting: ReflectionGroupVoting_meeting
  reflectionGroup: ReflectionGroupVoting_reflectionGroup
}

const UpvoteRow = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end'
})

const UpvoteIcon = styled(Icon)<{isExpanded: boolean; isEnabled: boolean}>(
  ({isExpanded, isEnabled}) => ({
    color: isExpanded
      ? isEnabled
        ? '#fff'
        : 'rgba(255, 255, 255, .25)'
      : isEnabled
        ? PALETTE.SLATE_600
        : PALETTE.SLATE_400,
    cursor: isEnabled ? 'pointer' : undefined,
    fontSize: ICON_SIZE.MD18,
    height: 24,
    lineHeight: '24px',
    textAlign: 'center',
    userSelect: 'none',
    width: 24
  })
)

const VoteCount = styled('span')<{voteCount: number; isExpanded: boolean}>(
  ({voteCount, isExpanded}) => ({
    color: isExpanded
      ? voteCount === 0
        ? PALETTE.SLATE_200
        : '#fff'
      : voteCount === 0
        ? PALETTE.SLATE_700
        : PALETTE.SKY_500,
    fontWeight: 600,
    padding: '0 4px',
    userSelect: 'none'
  })
)

const UpvoteColumn = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: 96
})

const makeHandleCompleted = (onCompleted: () => void, atmosphere: Atmosphere) => (res, errors) => {
  onCompleted()
  const error = getGraphQLError(res, errors)
  if (error) {
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: 'voteError',
      message: error.message || 'Error submitting vote',
      autoDismiss: 5
    })
  }
}

const ReflectionGroupVoting = (props: Props) => {
  const {isExpanded, meeting, reflectionGroup} = props
  const {id: reflectionGroupId} = reflectionGroup
  const {id: meetingId, localStage, maxVotesPerGroup, viewerMeetingMember} = meeting
  const {isComplete} = localStage!
  const votesRemaining = viewerMeetingMember?.votesRemaining ?? 0
  const viewerVoteCount = Math.max(0, reflectionGroup.viewerVoteCount || 0)
  const canUpvote = viewerVoteCount < maxVotesPerGroup && votesRemaining > 0 && !isComplete
  const canDownvote = viewerVoteCount > 0 && !isComplete

  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitMutation} = useMutationProps()
  const vote = () => {
    if (isComplete || isTempId(reflectionGroupId) || !canUpvote) return
    submitMutation()
    const handleCompleted = makeHandleCompleted(onCompleted, atmosphere)
    VoteForReflectionGroupMutation(
      atmosphere,
      {reflectionGroupId},
      {onError, onCompleted: handleCompleted, meetingId}
    )
  }
  const downvote = () => {
    if (isComplete || isTempId(reflectionGroupId) || !canDownvote) return
    submitMutation()
    const handleCompleted = makeHandleCompleted(onCompleted, atmosphere)
    VoteForReflectionGroupMutation(
      atmosphere,
      {isUnvote: true, reflectionGroupId},
      {onError, onCompleted: handleCompleted, meetingId}
    )
  }

  return (
    <UpvoteColumn>
      <UpvoteRow data-cy='reflection-vote-row'>
        <UpvoteIcon
          data-cy={`remove-vote`}
          isExpanded={isExpanded}
          isEnabled={canDownvote}
          color={isExpanded ? PALETTE.SKY_400 : PALETTE.SKY_500}
          onClick={downvote}
        >
          {'thumb_down'}
        </UpvoteIcon>
        <VoteCount
          isExpanded={isExpanded}
          voteCount={viewerVoteCount}
          data-cy={`completed-vote-count`}
        >
          {viewerVoteCount}
        </VoteCount>
        <UpvoteIcon
          data-cy={`add-vote`}
          isExpanded={isExpanded}
          isEnabled={canUpvote}
          color={isExpanded ? 'rgba(255, 255, 255, .65)' : PALETTE.SLATE_600}
          onClick={vote}
        >
          {'thumb_up'}
        </UpvoteIcon>
      </UpvoteRow>
    </UpvoteColumn>
  )
}

export default createFragmentContainer(withMutationProps(withAtmosphere(ReflectionGroupVoting)), {
  meeting: graphql`
    fragment ReflectionGroupVoting_meeting on RetrospectiveMeeting {
      localStage {
        isComplete
      }
      id
      viewerMeetingMember {
        votesRemaining
      }
      maxVotesPerGroup
    }
  `,
  reflectionGroup: graphql`
    fragment ReflectionGroupVoting_reflectionGroup on RetroReflectionGroup {
      id
      viewerVoteCount
    }
  `
})
