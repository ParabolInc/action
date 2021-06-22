import {PromoteNewMeetingFacilitatorMutation_meeting} from '../__generated__/PromoteNewMeetingFacilitatorMutation_meeting.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {OnNextHandler, SimpleMutation} from '../types/relayMutations'
import {PromoteNewMeetingFacilitatorMutation as TPromoteNewMeetingFacilitatorMutation} from '../__generated__/PromoteNewMeetingFacilitatorMutation.graphql'

graphql`
  fragment PromoteNewMeetingFacilitatorMutation_meeting on PromoteNewMeetingFacilitatorPayload {
    meeting {
      facilitatorUserId
      facilitator {
        # https://github.com/ParabolInc/parabol/issues/2984
        ...StageTimerModalEndTimeSlackToggle_facilitator
        userId
        preferredName
      }
    }
    oldFacilitator {
      isConnected
      preferredName
    }
    facilitatorStage {
      readyCount
      isViewerReady
    }
  }
`

const mutation = graphql`
  mutation PromoteNewMeetingFacilitatorMutation($facilitatorUserId: ID!, $meetingId: ID!) {
    promoteNewMeetingFacilitator(facilitatorUserId: $facilitatorUserId, meetingId: $meetingId) {
      error {
        message
      }
      ...PromoteNewMeetingFacilitatorMutation_meeting @relay(mask: false)
    }
  }
`

export const promoteNewMeetingFacilitatorMeetingOnNext: OnNextHandler<PromoteNewMeetingFacilitatorMutation_meeting> = (
  payload,
  {atmosphere}
) => {
  const {viewerId} = atmosphere
  const {oldFacilitator, meeting} = payload
  if (!oldFacilitator || !meeting) return
  const {isConnected, preferredName: oldFacilitatorName} = oldFacilitator
  const {
    facilitator: {preferredName: newFacilitatorName, userId: newFacilitatorUserId}
  } = meeting
  const isSelf = newFacilitatorUserId === viewerId
  const prefix = isConnected ? '' : `${oldFacilitatorName} disconnected! `
  const intro = isSelf ? 'You are' : `${newFacilitatorName} is`
  atmosphere.eventEmitter.emit('removeSnackbar', (snack) => snack.key.startsWith('newFacilitator'))
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 5,
    key: `newFacilitator:${newFacilitatorUserId}`,
    message: `${prefix}${intro} the new facilitator`
  })
}

const PromoteNewMeetingFacilitatorMutation: SimpleMutation<TPromoteNewMeetingFacilitatorMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TPromoteNewMeetingFacilitatorMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, facilitatorUserId} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return
      meeting.setValue(facilitatorUserId, 'facilitatorUserId')
    },
    onCompleted: (res) => {
      const payload = res.promoteNewMeetingFacilitator
      if (payload) {
        promoteNewMeetingFacilitatorMeetingOnNext(payload, {
          atmosphere
        })
      }
    }
  })
}

export default PromoteNewMeetingFacilitatorMutation
