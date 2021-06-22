import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import extractTextFromDraftString from '~/utils/draftjs/extractTextFromDraftString'
import Atmosphere from '../Atmosphere'
import {
  OnNextHandler,
  OnNextHistoryContext,
  OptionalHandlers,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import makeEmptyStr from '../utils/draftjs/makeEmptyStr'
import clientTempId from '../utils/relay/clientTempId'
import createProxyRecord from '../utils/relay/createProxyRecord'
import getOptimisticTaskEditor from '../utils/relay/getOptimisticTaskEditor'
import {CreateTaskMutation as TCreateTaskMutation} from '../__generated__/CreateTaskMutation.graphql'
import {CreateTaskMutation_notification} from '../__generated__/CreateTaskMutation_notification.graphql'
import {CreateTaskMutation_task} from '../__generated__/CreateTaskMutation_task.graphql'
import handleAddNotifications from './handlers/handleAddNotifications'
import handleEditTask from './handlers/handleEditTask'
import handleUpsertTasks from './handlers/handleUpsertTasks'
import popInvolvementToast from './toasts/popInvolvementToast'

graphql`
  fragment CreateTaskMutation_task on CreateTaskPayload {
    task {
      ...CompleteTaskFrag @relay(mask: false)
      ...ThreadedItemReply_threadable
      ...ThreadedItem_threadable
      threadSource
      threadId
      threadSortOrder
      threadParentId
      replies {
        ...ThreadedRepliesList_replies
      }
    }
  }
`

graphql`
  fragment CreateTaskMutation_notification on CreateTaskPayload {
    involvementNotification {
      team {
        id
      }
      ...TaskInvolves_notification @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation CreateTaskMutation($newTask: CreateTaskInput!) {
    createTask(newTask: $newTask) {
      error {
        message
      }
      ...CreateTaskMutation_task @relay(mask: false)
    }
  }
`

export const createTaskTaskUpdater: SharedUpdater<CreateTaskMutation_task> = (payload, {store}) => {
  const task = payload.getLinkedRecord('task')
  if (!task) return
  const taskId = task.getValue('id')
  const userId = task.getValue('userId')
  const content = task.getValue('content')
  const rawContent = JSON.parse(content)
  const {blocks} = rawContent
  const isEditing = blocks.length === 0 || (blocks.length === 1 && blocks[0].text === '')
  const editorPayload = getOptimisticTaskEditor(store, userId, taskId, isEditing)
  handleEditTask(editorPayload, store)
  handleUpsertTasks(task, store)
}

export const createTaskNotificationOnNext: OnNextHandler<
  CreateTaskMutation_notification,
  OnNextHistoryContext
> = (payload, {atmosphere, history}) => {
  if (!payload || !payload.involvementNotification) return
  popInvolvementToast(payload.involvementNotification, {atmosphere, history})
}

export const createTaskNotificationUpdater: SharedUpdater<CreateTaskMutation_notification> = (
  payload,
  {store}
) => {
  const notification = payload.getLinkedRecord('involvementNotification' as any)
  if (!notification) return
  handleAddNotifications(notification, store)
}

const CreateTaskMutation: StandardMutation<TCreateTaskMutation, OptionalHandlers> = (
  atmosphere: Atmosphere,
  variables,
  {onError, onCompleted}
) => {
  const {viewerId} = atmosphere
  const {newTask} = variables
  const isEditing = !newTask.content
  return commitMutation<TCreateTaskMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const context = {atmosphere, store}
      const payload = store.getRootField('createTask')
      if (!payload) return
      createTaskTaskUpdater(payload, context)
    },
    optimisticUpdater: (store) => {
      const {teamId, userId} = newTask
      const now = new Date().toJSON()
      const taskId = clientTempId(teamId)
      const viewer = store.getRoot().getLinkedRecord('viewer')
      const plaintextContent = newTask.plaintextContent || (
        newTask.content ? extractTextFromDraftString(newTask.content) : '')
      const optimisticTask = {
        ...newTask,
        id: taskId,
        teamId,
        userId,
        createdAt: now,
        createdBy: viewerId,
        updatedAt: now,
        tags: [],
        content: newTask.content || makeEmptyStr(),
        plaintextContent
      }
      const task = createProxyRecord(store, 'Task', optimisticTask)
        .setLinkedRecord(store.get(teamId)!, 'team')
        .setLinkedRecord(userId ? store.get(userId)! : null, 'user')
        .setLinkedRecord(viewer, 'createdByUser')
        .setLinkedRecords([], 'replies')
      const editorPayload = getOptimisticTaskEditor(store, userId, taskId, isEditing)
      handleEditTask(editorPayload, store)
      handleUpsertTasks(task as any, store)
    },
    onError,
    onCompleted
  })
}

export default CreateTaskMutation
