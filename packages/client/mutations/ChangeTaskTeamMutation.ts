import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ChangeTaskTeamMutation_task} from '~/__generated__/ChangeTaskTeamMutation_task.graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import getBaseRecord from '../utils/relay/getBaseRecord'
import safeRemoveNodeFromUnknownConn from '../utils/relay/safeRemoveNodeFromUnknownConn'
import updateProxyRecord from '../utils/relay/updateProxyRecord'
import {
  ChangeTaskTeamMutation as TChangeTaskTeamMutation,
  ChangeTaskTeamMutationResponse
} from '../__generated__/ChangeTaskTeamMutation.graphql'
import handleUpsertTasks from './handlers/handleUpsertTasks'

graphql`
  fragment ChangeTaskTeamMutation_task on ChangeTaskTeamPayload {
    task {
      ...CompleteTaskFrag @relay(mask: false)
      editors {
        userId
        preferredName
      }
    }
    removedTaskId
  }
`

const mutation = graphql`
  mutation ChangeTaskTeamMutation($taskId: ID!, $teamId: ID!) {
    changeTaskTeam(taskId: $taskId, teamId: $teamId) {
      error {
        message
      }
      ...ChangeTaskTeamMutation_task @relay(mask: false)
    }
  }
`

type Task = NonNullable<NonNullable<ChangeTaskTeamMutationResponse['changeTaskTeam']>['task']>

export const changeTaskTeamTaskUpdater: SharedUpdater<ChangeTaskTeamMutation_task> = (
  payload,
  {store}
) => {
  const task = payload.getLinkedRecord('task')
  const taskId = (task && task.getValue('id')) || payload.getValue('removedTaskId')
  if (!taskId) return
  const oldTask = getBaseRecord(store, taskId) as Partial<Task> | null
  if (!oldTask) return
  const oldTeamId = oldTask.teamId || (oldTask.team && oldTask.team.id)
  if (!oldTeamId) return
  safeRemoveNodeFromUnknownConn(store, oldTeamId, 'TeamColumnsContainer_tasks', taskId)
  handleUpsertTasks(task, store)
}

const ChangeTaskTeamMutation: StandardMutation<TChangeTaskTeamMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TChangeTaskTeamMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('changeTaskTeam')
      if (!payload) return
      changeTaskTeamTaskUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {taskId, teamId} = variables
      if (!taskId) return
      const task = store.get<Task>(taskId)
      if (!task) return
      const now = new Date()
      const optimisticTask = {
        updatedAt: now.toJSON()
      }
      updateProxyRecord(task, optimisticTask)
      task.setValue(teamId, 'teamId')
      const team = store.get(teamId)
      if (team) {
        task.setLinkedRecord(team, 'team')
      }
      handleUpsertTasks(task, store)
    },
    onError,
    onCompleted
  })
}

export default ChangeTaskTeamMutation
