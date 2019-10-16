import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import {ReflectionGroupVoting_meeting} from '../__generated__/ReflectionGroupVoting_meeting.graphql'
import {ReflectionGroupVoting_reflectionGroup} from '../__generated__/ReflectionGroupVoting_reflectionGroup.graphql'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import VoteForReflectionGroupMutation from '../mutations/VoteForReflectionGroupMutation'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import {meetingVoteIcon} from '../styles/meeting'
import NewMeetingCheckInMutation from '../mutations/NewMeetingCheckInMutation'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import Icon from './Icon'
import getGraphQLError from '../utils/relay/getGraphQLError'

interface Props extends WithMutationProps, WithAtmosphereProps {
  isExpanded: boolean
  meeting: ReflectionGroupVoting_meeting
  reflectionGroup: ReflectionGroupVoting_reflectionGroup
}

const UpvoteRow = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
})

const UpvoteIcon = styled(Icon)<{color: string}>(({color}) => ({
  color,
  cursor: 'pointer',
  fontSize: ICON_SIZE.MD18,
  height: 24,
  lineHeight: '24px',
  marginLeft: 8,
  textAlign: 'center',
  userSelect: 'none',
  width: 24
}))

const UpvoteColumn = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: 96
})

class ReflectionGroupVoting extends Component<Props> {
  vote = () => {
    const {atmosphere, meeting, onError, onCompleted, reflectionGroup, submitMutation} = this.props

    const {
      meetingId,
      viewerMeetingMember: {isCheckedIn}
    } = meeting
    const {id: reflectionGroupId} = reflectionGroup
    submitMutation()
    const handleCompleted = (res, errors) => {
      onCompleted()
      const error = getGraphQLError(res, errors)
      if (error) {
        atmosphere.eventEmitter.emit('addSnackbar', {
          key: 'voteError',
          message: error,
          autoDismiss: 5
        })
      }
    }
    const sendVote = () =>
      VoteForReflectionGroupMutation(
        atmosphere,
        {reflectionGroupId},
        {onError, onCompleted: handleCompleted, meetingId}
      )
    if (!isCheckedIn) {
      const {viewerId: userId} = atmosphere
      NewMeetingCheckInMutation(
        atmosphere,
        {meetingId, userId, isCheckedIn: true},
        {onError, onCompleted: sendVote}
      )
    } else {
      sendVote()
    }
  }

  unvote = () => {
    const {atmosphere, meeting, onError, onCompleted, reflectionGroup, submitMutation} = this.props
    const {meetingId, localStage} = meeting
    const {isComplete} = localStage!
    if (isComplete) return
    const {id: reflectionGroupId} = reflectionGroup
    const handleCompleted = (res, errors) => {
      onCompleted()
      const error = getGraphQLError(res, errors)
      if (error) {
        atmosphere.eventEmitter.emit('addSnackbar', {
          key: 'unvoteError',
          message: typeof error === 'string' ? error : error.message,
          autoDismiss: 5
        })
      }
    }
    submitMutation()
    VoteForReflectionGroupMutation(
      atmosphere,
      {isUnvote: true, reflectionGroupId},
      {onError, onCompleted: handleCompleted, meetingId}
    )
  }

  render() {
    const {meeting, reflectionGroup, isExpanded} = this.props
    const viewerVoteCount = reflectionGroup.viewerVoteCount || 0
    const {localStage, settings, viewerMeetingMember} = meeting
    const {maxVotesPerGroup} = settings
    const {votesRemaining} = viewerMeetingMember
    const {isComplete} = localStage!
    const upvotes = [...Array(viewerVoteCount).keys()]
    const canVote = viewerVoteCount < maxVotesPerGroup && votesRemaining > 0 && !isComplete
    return (
      <UpvoteColumn>
        <UpvoteRow>
          {upvotes.map((idx) => (
            <UpvoteIcon
              key={idx}
              color={isExpanded ? PALETTE.EMPHASIS_COOL_LIGHTER : PALETTE.EMPHASIS_COOL}
              onClick={this.unvote}
            >
              {meetingVoteIcon}
            </UpvoteIcon>
          ))}
          {canVote && (
            <UpvoteIcon
              color={isExpanded ? 'rgba(255, 255, 255, .65)' : PALETTE.TEXT_GRAY}
              onClick={this.vote}
            >
              {meetingVoteIcon}
            </UpvoteIcon>
          )}
        </UpvoteRow>
      </UpvoteColumn>
    )
  }
}

export default createFragmentContainer(withMutationProps(withAtmosphere(ReflectionGroupVoting)), {
  meeting: graphql`
    fragment ReflectionGroupVoting_meeting on RetrospectiveMeeting {
      localStage {
        isComplete
      }
      meetingId: id
      viewerMeetingMember {
        isCheckedIn
        ... on RetrospectiveMeetingMember {
          votesRemaining
        }
      }
      settings {
        maxVotesPerGroup
        totalVotes
      }
    }
  `,
  reflectionGroup: graphql`
    fragment ReflectionGroupVoting_reflectionGroup on RetroReflectionGroup {
      id
      viewerVoteCount
    }
  `
})
