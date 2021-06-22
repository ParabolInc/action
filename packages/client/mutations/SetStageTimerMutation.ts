import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RelayDateHack, SharedUpdater, StandardMutation} from '../types/relayMutations'
import {SetStageTimerMutation as _SetStageTimerMutation} from '../__generated__/SetStageTimerMutation.graphql'
import {SetStageTimerMutation_meeting} from '~/__generated__/SetStageTimerMutation_meeting.graphql'
import LocalTimeHandler from '../utils/relay/LocalTimeHandler'

graphql`
  fragment SetStageTimerMutation_meeting on SetStageTimerPayload {
    stage {
      isAsync
      scheduledEndTime
      timeRemaining
    }
  }
`

const mutation = graphql`
  mutation SetStageTimerMutation(
    $meetingId: ID!
    $scheduledEndTime: DateTime
    $timeRemaining: Float
  ) {
    setStageTimer(
      meetingId: $meetingId
      scheduledEndTime: $scheduledEndTime
      timeRemaining: $timeRemaining
    ) {
      error {
        message
      }
      ...SetStageTimerMutation_meeting @relay(mask: false)
    }
  }
`

export const setStageTimerMeetingUpdater: SharedUpdater<SetStageTimerMutation_meeting> = (
  payload,
  {store}
) => {
  const stage = payload.getLinkedRecord('stage')
  if (!stage) return

  LocalTimeHandler.update(store, {
    dataID: stage.getDataID(),
    fieldKey: 'scheduledEndTime',
    args: {},
    handle: '',
    handleKey: ''
  })
}

type Stage = NonNullable<SetStageTimerMutation_meeting['stage']>
type TSetStageTimerMutation = RelayDateHack<
  _SetStageTimerMutation,
  {scheduledEndTime?: Date | null}
>
const SetStageTimerMutation: StandardMutation<TSetStageTimerMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetStageTimerMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('setStageTimer')
      setStageTimerMeetingUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {meetingId, scheduledEndTime, timeRemaining} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return
      const facilitatorStageId = meeting.getValue('facilitatorStageId')! as string
      const stage = store.get<Stage>(facilitatorStageId)
      if (!stage) return
      const endTime = scheduledEndTime ? scheduledEndTime.toJSON() : null
      const isAsync = scheduledEndTime ? !timeRemaining : null
      stage.setValue(endTime, 'scheduledEndTime')
      stage.setValue(timeRemaining, 'timeRemaining')
      stage.setValue(isAsync, 'isAsync')
    },
    onCompleted,
    onError
  })
}

export default SetStageTimerMutation
