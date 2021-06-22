import {createTaskTaskUpdater} from '../mutations/CreateTaskMutation'
import {deleteTaskTaskUpdater} from '../mutations/DeleteTaskMutation'
import {editTaskTaskUpdater} from '../mutations/EditTaskMutation'
import {updateTaskTaskOnNext, updateTaskTaskUpdater} from '../mutations/UpdateTaskMutation'
import {removeOrgUserTaskUpdater} from '../mutations/RemoveOrgUserMutation'
import {changeTaskTeamTaskUpdater} from '../mutations/ChangeTaskTeamMutation'
import graphql from 'babel-plugin-relay/macro'
import {RecordSourceSelectorProxy, requestSubscription, Variables} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {TaskSubscriptionResponse} from '~/__generated__/TaskSubscription.graphql'
import {RouterProps} from 'react-router'

const subscription = graphql`
  subscription TaskSubscription {
    taskSubscription {
      __typename
      ...RemoveTeamMemberMutation_task @relay(mask: false)
      ...ChangeTaskTeamMutation_task @relay(mask: false)
      ...CreateGitHubTaskIntegrationMutation_task @relay(mask: false)
      ...CreateJiraTaskIntegrationMutation_task @relay(mask: false)
      ...CreateTaskMutation_task @relay(mask: false)
      ...DeleteTaskMutation_task @relay(mask: false)
      ...EditTaskMutation_task @relay(mask: false)
      ...RemoveOrgUserMutation_task @relay(mask: false)
      ...UpdateTaskMutation_task @relay(mask: false)
      ...UpdateTaskDueDateMutation_task @relay(mask: false)
    }
  }
`

const onNextHandlers = {
  UpdateTaskPayload: updateTaskTaskOnNext
}

const TaskSubscription = (
  atmosphere: Atmosphere,
  variables: Variables,
  router: {history: RouterProps['history']}
) => {
  const {viewerId} = atmosphere
  return requestSubscription<TaskSubscriptionResponse>(atmosphere, {
    subscription,
    variables,
    updater: (store) => {
      const payload = store.getRootField('taskSubscription') as any
      if (!payload) return
      const type = payload.getValue('__typename')
      const context = {atmosphere, store: store as RecordSourceSelectorProxy<any>}
      switch (type) {
        case 'CreateGitHubTaskIntegrationPayload':
          break
        case 'ChangeTaskTeamPayload':
          changeTaskTeamTaskUpdater(payload, context)
          break
        case 'CreateTaskPayload':
          createTaskTaskUpdater(payload, context)
          break
        case 'DeleteTaskPayload':
          deleteTaskTaskUpdater(payload, store)
          break
        case 'EditTaskPayload':
          editTaskTaskUpdater(payload, store)
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserTaskUpdater(payload, store, viewerId)
          break
        case 'UpdateTaskPayload':
          updateTaskTaskUpdater(payload, context)
          break
        case 'UpdateTaskDueDatePayload':
          break
        default:
          console.error('TaskSubscription case fail', type)
      }
    },
    onNext: (result) => {
      if (!result) return
      const {taskSubscription} = result
      const {__typename: type} = taskSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(taskSubscription, {...router, atmosphere})
      }
    },
    onCompleted: () => {
      atmosphere.unregisterSub(TaskSubscription.name, variables)
    }
  })
}
TaskSubscription.key = 'task'
export default TaskSubscription
