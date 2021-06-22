import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {BaseLocalHandlers, StandardMutation} from '../types/relayMutations'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import {
  VoteForReflectionGroupMutation as TVoteForReflectionGroupMutation,
  VoteForReflectionGroupMutationResponse
} from '../__generated__/VoteForReflectionGroupMutation.graphql'

graphql`
  fragment VoteForReflectionGroupMutation_meeting on VoteForReflectionGroupPayload {
    error {
      message
      title
    }
    meeting {
      votesRemaining
    }
    meetingMember {
      votesRemaining
    }
    reflectionGroup {
      viewerVoteCount
      voteCount
    }
    unlockedStages {
      id
      isNavigable
      isNavigableByFacilitator
    }
  }
`

const mutation = graphql`
  mutation VoteForReflectionGroupMutation($reflectionGroupId: ID!, $isUnvote: Boolean) {
    voteForReflectionGroup(reflectionGroupId: $reflectionGroupId, isUnvote: $isUnvote) {
      ...VoteForReflectionGroupMutation_meeting @relay(mask: false)
    }
  }
`

interface Handlers extends BaseLocalHandlers {
  meetingId: string
}

type RetrospectiveMeetingMember = NonNullable<
  NonNullable<VoteForReflectionGroupMutationResponse['voteForReflectionGroup']>['meetingMember']
>
type RetroReflectionGroup = NonNullable<
  NonNullable<VoteForReflectionGroupMutationResponse['voteForReflectionGroup']>['reflectionGroup']
>

const VoteForReflectionGroupMutation: StandardMutation<
  TVoteForReflectionGroupMutation,
  Handlers
> = (atmosphere, variables, {onError, onCompleted, meetingId}) => {
  return commitMutation<TVoteForReflectionGroupMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {reflectionGroupId, isUnvote} = variables
      const reflectionGroupProxy = store.get<RetroReflectionGroup>(reflectionGroupId)
      if (!reflectionGroupProxy) return
      const increment = isUnvote ? -1 : 1
      const meetingMemberId = toTeamMemberId(meetingId, viewerId)
      const meetingMemberProxy = store.get<RetrospectiveMeetingMember>(meetingMemberId)
      if (!meetingMemberProxy) return
      const viewerVoteCount = reflectionGroupProxy.getValue('viewerVoteCount') || 0
      const votesRemaining = meetingMemberProxy.getValue('votesRemaining') || 0
      reflectionGroupProxy.setValue(viewerVoteCount + increment, 'viewerVoteCount')
      meetingMemberProxy.setValue(votesRemaining - increment, 'votesRemaining')
    }
  })
}

export default VoteForReflectionGroupMutation
