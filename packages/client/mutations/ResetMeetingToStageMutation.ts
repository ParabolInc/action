import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {
  ResetMeetingToStageMutation as TResetMeetingToStageMutation,
  ResetMeetingToStageMutationVariables
} from '../__generated__/ResetMeetingToStageMutation.graphql'
import Atmosphere from '~/Atmosphere'

graphql`
  fragment ResetMeetingToStageMutation_meeting on ResetMeetingToStagePayload {
    meeting {
      id
      phases {
        id
        stages {
          id
          isComplete
          isNavigable
          isNavigableByFacilitator
        }
      }
      ... on RetrospectiveMeeting {
        viewerMeetingMember {
          id
          votesRemaining
        }
        votesRemaining
        reflectionGroups {
          id
          meetingId
          viewerVoteCount
          tasks {
            id
          }
          thread(first: 1000) @connection(key: "DiscussionThread_thread") {
            edges {
              node {
                id
                threadId
                threadSource
              }
            }
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation ResetMeetingToStageMutation($meetingId: ID!, $stageId: ID!) {
    resetMeetingToStage(meetingId: $meetingId, stageId: $stageId) {
      error {
        message
      }
      ...ResetMeetingToStageMutation_meeting @relay(mask: false)
    }
  }
`

const ResetMeetingToStageMutation: SimpleMutation<TResetMeetingToStageMutation> = (
  atmosphere: Atmosphere,
  variables: ResetMeetingToStageMutationVariables
) => {
  return commitMutation<TResetMeetingToStageMutation>(atmosphere, {
    mutation,
    variables
  })
}

export default ResetMeetingToStageMutation
