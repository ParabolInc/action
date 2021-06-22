import {ASSIGNEE, MENTIONEE} from 'parabol-client/utils/constants'
import getTypeFromEntityMap from 'parabol-client/utils/draftjs/getTypeFromEntityMap'
import getRethink from '../../../database/rethinkDriver'
import NotificationTaskInvolves from '../../../database/types/NotificationTaskInvolves'
import Task from '../../../database/types/Task'
import segmentIo from '../../../utils/segmentIo'

const publishChangeNotifications = async (
  task: Task,
  oldTask: Task,
  changeUserId: string,
  usersToIgnore: string[]
) => {
  const r = await getRethink()
  const changeAuthorId = `${changeUserId}::${task.teamId}`
  const {entityMap: oldEntityMap, blocks: oldBlocks} = JSON.parse(oldTask.content)
  const {entityMap, blocks} = JSON.parse(task.content)
  const wasPrivate = oldTask.tags.includes('private')
  const isPrivate = task.tags.includes('private')
  const oldMentions = wasPrivate ? [] : getTypeFromEntityMap('MENTION', oldEntityMap)
  const mentions = isPrivate ? [] : getTypeFromEntityMap('MENTION', entityMap)
  // intersect the mentions to get the ones to add and remove
  const userIdsToRemove = oldMentions.filter((userId) => !mentions.includes(userId))
  const notificationsToAdd = mentions
    .filter(
      (userId) =>
        // it didn't already exist
        !oldMentions.includes(userId) &&
        // it isn't the owner (they get the assign notification)
        userId !== task.userId &&
        // it isn't the person changing it
        changeUserId !== userId &&
        // it isn't someone in a meeting
        !usersToIgnore.includes(userId)
    )
    .map(
      (userId) =>
        new NotificationTaskInvolves({
          userId,
          involvement: MENTIONEE,
          taskId: task.id,
          changeAuthorId,
          teamId: task.teamId
        })
    )

  mentions.forEach((mentionedUserId) => {
    segmentIo.track({
      userId: changeUserId,
      event: 'Mentioned on Task',
      properties: {
        mentionedUserId,
        teamId: task.teamId
      }
    })
  })
  // add in the assignee changes
  if (oldTask.userId && oldTask.userId !== task.userId) {
    if (task.userId && task.userId !== changeUserId && !usersToIgnore.includes(task.userId)) {
      notificationsToAdd.push(
        new NotificationTaskInvolves({
          userId: task.userId,
          involvement: ASSIGNEE,
          taskId: task.id,
          changeAuthorId,
          teamId: task.teamId
        })
      )
    }
    userIdsToRemove.push(oldTask.userId)
  }

  // if we updated the task content, push a new one with an updated task
  const oldContentLen = oldBlocks[0] ? oldBlocks[0].text.length : 0
  if (oldContentLen < 3) {
    const contentLen = blocks[0] ? blocks[0].text.length : 0
    if (contentLen > oldContentLen && task.userId) {
      const maybeInvolvedUserIds = mentions.concat(task.userId)
      const existingTaskNotifications = (await r
        .table('Notification')
        .getAll(r.args(maybeInvolvedUserIds), {index: 'userId'})
        .filter({
          taskId: task.id,
          type: 'TASK_INVOLVES'
        })
        .run()) as NotificationTaskInvolves[]
      notificationsToAdd.push(...existingTaskNotifications)
    }
  }

  // update changes in the db
  if (notificationsToAdd.length) {
    await r
      .table('Notification')
      .insert(notificationsToAdd)
      .run()
  }
  return {notificationsToAdd}
}

export default publishChangeNotifications
