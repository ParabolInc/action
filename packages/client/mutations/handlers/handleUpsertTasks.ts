import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import getThreadSourceThreadConn from '~/mutations/connections/getThreadSourceThreadConn'
import addNodeToArray from '../../utils/relay/addNodeToArray'
import safeRemoveNodeFromConn from '../../utils/relay/safeRemoveNodeFromConn'
import getArchivedTasksConn from '../connections/getArchivedTasksConn'
import getTeamTasksConn from '../connections/getTeamTasksConn'
import getUserTasksConn from '../connections/getUserTasksConn'
import pluralizeHandler from './pluralizeHandler'
import safePutNodeInConn from './safePutNodeInConn'
import isTaskPrivate from '~/utils/isTaskPrivate'
import {parseUserTaskFilterQueryParams} from '~/utils/useUserTaskFilters'
import getScopingTasksConn from '../connections/getScopingTasksConn'

type Task = RecordProxy<{
  readonly id: string
  readonly teamId: string
  readonly tags: readonly string[]
  readonly threadId: string | null
  readonly threadSource: string | null
  readonly threadParentId: string | null
  readonly meetingId: string | null
  readonly updatedAt: string | null
  readonly userId: string | null
}>

const handleUpsertTask = (task: Task | null, store: RecordSourceSelectorProxy<any>) => {
  if (!task) return
  // we currently have 4 connections: user, team, team archive, scoping
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer) return
  const viewerId = viewer.getDataID()
  const teamId = task.getValue('teamId')
  const taskId = task.getValue('id')
  const tags = task.getValue('tags')
  const threadParentId = task.getValue('threadParentId')
  if (threadParentId) {
    addNodeToArray(task, store.get(threadParentId), 'replies', 'threadSortOrder')
    return
  }
  const meetingId = task.getValue('meetingId')
  const isNowArchived = tags.includes('archived')
  const {userIds, teamIds} = parseUserTaskFilterQueryParams(viewerId, window.location)
  const archiveConns = [
    /* archived task conn in user dash*/ getArchivedTasksConn(viewer, userIds, teamIds),
    /* archived task conn in team dash*/ getArchivedTasksConn(viewer, null, [teamId])
  ]
  const team = store.get(teamId)
  const teamConn = getTeamTasksConn(team)
  const userConn = getUserTasksConn(viewer, userIds, teamIds)
  const threadSourceId = task.getValue('threadId')
  const threadSourceProxy = (threadSourceId && store.get(threadSourceId as string)) || null
  const threadSourceConn = getThreadSourceThreadConn(threadSourceProxy)
  const meeting = meetingId ? store.get(meetingId) : null

  if (isNowArchived) {
    safeRemoveNodeFromConn(taskId, teamConn)
    safeRemoveNodeFromConn(taskId, userConn)
    archiveConns.forEach((archiveConn) => safePutNodeInConn(archiveConn, task, store))
  } else {
    archiveConns.forEach((archiveConn) => safeRemoveNodeFromConn(taskId, archiveConn))
    safePutNodeInConn(teamConn, task, store)
    safePutNodeInConn(threadSourceConn, task, store, 'threadSortOrder', true)
    addNodeToArray(task, meeting, 'tasks', 'createdAt')
    if (userConn) {
      const isPrivate = isTaskPrivate(tags)
      const ownedByViewer = task.getValue('userId') === viewerId
      if (isPrivate && !ownedByViewer) {
        safeRemoveNodeFromConn(taskId, userConn)
      } else {
        safePutNodeInConn(userConn, task, store)
      }
    }
  }
  /* updates parabol search query if task is created from a sprint poker meeting
   * should also implement updating parabol search query if task is created elsewhere?
   */
  const scopingTasksConn = getScopingTasksConn(store, meetingId, viewer, [teamId])
  safePutNodeInConn(scopingTasksConn, task, store, 'updatedAt', false)
}

const handleUpsertTasks = pluralizeHandler(handleUpsertTask)
export default handleUpsertTasks
