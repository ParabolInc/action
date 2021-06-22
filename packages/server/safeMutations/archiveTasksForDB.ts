import {convertFromRaw, convertToRaw} from 'draft-js'
import getRethink from '../database/rethinkDriver'
import addTagToTask from 'parabol-client/utils/draftjs/addTagToTask'
import getTagsFromEntityMap from 'parabol-client/utils/draftjs/getTagsFromEntityMap'
import Task from '../database/types/Task'

const archiveTasksForDB = async (tasks: Task[], doneMeetingId?: string) => {
  if (!tasks || tasks.length === 0) return []
  const r = await getRethink()
  const tasksToArchive = tasks.map((task) => {
    const contentState = convertFromRaw(JSON.parse(task.content))
    const nextContentState = addTagToTask(contentState, '#archived')
    const raw = convertToRaw(nextContentState)
    const nextTags = getTagsFromEntityMap(raw.entityMap)
    const nextContentStr = JSON.stringify(raw)
    return {
      content: nextContentStr,
      doneMeetingId,
      tags: nextTags,
      id: task.id
    }
  })
  return r(tasksToArchive)
    .forEach((task) => {
      return r
        .table('Task')
        .get(task('id'))
        .update(
          {
            content: task('content') as unknown,
            tags: task('tags'),
            doneMeetingId: task('doneMeetingId').default(null)
          } as any,
          {returnChanges: true}
        )
    })
    .default([])('changes')('new_val')
    .run()
}

export default archiveTasksForDB
