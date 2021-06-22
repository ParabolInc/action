import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import ITask from '../../server/database/types/Task'
import {
  OnNextHandler,
  OnNextHistoryContext,
  OptionalHandlers,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import getTagsFromEntityMap from '../utils/draftjs/getTagsFromEntityMap'
import ContentFilterHandler from '../utils/relay/ContentFilterHandler'
import getInProxy from '../utils/relay/getInProxy'
import updateProxyRecord from '../utils/relay/updateProxyRecord'
import {UpdateTaskMutation as TUpdateTaskMutation} from '../__generated__/UpdateTaskMutation.graphql'
import {UpdateTaskMutation_task} from '../__generated__/UpdateTaskMutation_task.graphql'
import handleAddNotifications from './handlers/handleAddNotifications'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import handleUpsertTasks from './handlers/handleUpsertTasks'
import popInvolvementToast from './toasts/popInvolvementToast'

graphql`
  fragment UpdateTaskMutation_task on UpdateTaskPayload {
    task {
      # Entire frag needed in case it is deprivatized
      ...CompleteTaskFrag @relay(mask: false)
      id
      editors {
        userId
        preferredName
      }
    }
    addedNotification {
      type
      changeAuthor {
        preferredName
      }
      team {
        id
      }
      ...TaskInvolves_notification @relay(mask: false)
    }
    privatizedTaskId
  }
`

const mutation = graphql`
  mutation UpdateTaskMutation($updatedTask: UpdateTaskInput!, $area: AreaEnum) {
    updateTask(updatedTask: $updatedTask, area: $area) {
      error {
        message
      }
      ...UpdateTaskMutation_task @relay(mask: false)
    }
  }
`

export const updateTaskTaskOnNext: OnNextHandler<UpdateTaskMutation_task, OnNextHistoryContext> = (
  payload,
  {atmosphere, history}
) => {
  if (!payload || !payload.addedNotification) return
  popInvolvementToast(payload.addedNotification, {atmosphere, history})
}

export const updateTaskTaskUpdater: SharedUpdater<UpdateTaskMutation_task> = (payload, {store}) => {
  const task = payload.getLinkedRecord('task')!
  handleUpsertTasks(task as any, store as any)

  const addedNotification = payload.getLinkedRecord('addedNotification')
  handleAddNotifications(addedNotification as any, store)
  if (task) {
    ContentFilterHandler.update(store, {
      dataID: task.getDataID(),
      fieldKey: 'content'
    })
  }
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const viewerId = viewer && viewer.getDataID()
  const privatizedTaskId = payload.getValue('privatizedTaskId')
  const taskUserId = getInProxy(task, 'userId')
  if (taskUserId !== viewerId && privatizedTaskId) {
    handleRemoveTasks(privatizedTaskId, store)
  }
}

const UpdateTaskMutation: StandardMutation<TUpdateTaskMutation, OptionalHandlers> = (
  atmosphere,
  {updatedTask, area},
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateTaskMutation>(atmosphere, {
    mutation,
    variables: {
      area,
      updatedTask
    },
    updater: (store) => {
      const payload = store.getRootField('updateTask')
      if (!payload) return
      const error = payload.getLinkedRecord('error')
      if (error) {
        const {id: taskId} = updatedTask
        const task = store.get<ITask>(taskId)
        if (task) {
          const message = error.getValue('message')
          task.setValue(message, 'error')
        }
      }
      updateTaskTaskUpdater(payload, {atmosphere, store: store as any})
    },
    optimisticUpdater: (store) => {
      const {id, content, teamId, userId} = updatedTask
      const task = store.get(id)
      if (!task) return
      const now = new Date()
      const optimisticTask = {
        ...updatedTask,
        updatedAt: now.toJSON()
      }
      updateProxyRecord(task, optimisticTask)
      if (teamId) {
        task.setValue(teamId, 'teamId')
        task.setLinkedRecord(store.get(teamId)!, 'team')
      }
      if (userId) {
        task.setValue(userId, 'userId')
        task.setLinkedRecord(store.get(userId)!, 'user')
      }
      if (content) {
        const {entityMap} = JSON.parse(content)
        const nextTags = getTagsFromEntityMap(entityMap)
        task.setValue(nextTags, 'tags')
      }
      handleUpsertTasks(task as any, store)
    },
    onError,
    onCompleted
  })
}

export default UpdateTaskMutation
