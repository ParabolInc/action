import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {DragEstimatingTaskMutation_meeting} from '~/__generated__/DragEstimatingTaskMutation_meeting.graphql'
import {SharedUpdater, SimpleMutation} from '../types/relayMutations'
import {DragEstimatingTaskMutation as IDragEstimatingTaskMutation} from '../__generated__/DragEstimatingTaskMutation.graphql'
import handleUpdateStageSort from './handlers/handleUpdateStageSort'

graphql`
  fragment DragEstimatingTaskMutation_meeting on DragEstimatingTaskSuccess {
    stage {
      id
      sortOrder
    }
    meetingId
  }
`

const mutation = graphql`
  mutation DragEstimatingTaskMutation($meetingId: ID!, $stageId: ID!, $sortOrder: Float!) {
    dragEstimatingTask(meetingId: $meetingId, stageId: $stageId, sortOrder: $sortOrder) {
      ...DragEstimatingTaskMutation_meeting @relay(mask: false)
    }
  }
`

export const dragEstimatingTaskMeetingUpdater: SharedUpdater<DragEstimatingTaskMutation_meeting> = (
  payload,
  {store}
) => {
  const meetingId = payload.getValue('meetingId')
  handleUpdateStageSort(store, meetingId, 'ESTIMATE')
}

const DragEstimatingTaskMutation: SimpleMutation<IDragEstimatingTaskMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<IDragEstimatingTaskMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('dragEstimatingTask')
      if (!payload) return
      dragEstimatingTaskMeetingUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {meetingId, stageId, sortOrder} = variables
      const stage = store.get(stageId)
      if (!stage) return
      stage.setValue(sortOrder, 'sortOrder')
      handleUpdateStageSort(store, meetingId, 'ESTIMATE')
    }
  })
}

export default DragEstimatingTaskMutation
