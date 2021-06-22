import convertToTaskContent from 'parabol-client/utils/draftjs/convertToTaskContent'
import getTagsFromEntityMap from 'parabol-client/utils/draftjs/getTagsFromEntityMap'
import getRethink from '../../../database/rethinkDriver'
import {TaskStatusEnum} from '../../../database/types/Task'
import generateUID from '../../../generateUID'

const CONTENT_STRING = `
  This is a task card. They can be created here, in a meeting, or via an integration`

const SEED_TASKS = [
  {
    status: 'active' as TaskStatusEnum,
    sortOrder: 0,
    content: convertToTaskContent(CONTENT_STRING),
    plaintextContent: CONTENT_STRING
  }
]

export default async (userId, teamId) => {
  const r = await getRethink()
  const now = new Date()

  const seedTasks = SEED_TASKS.map((proj) => ({
    ...proj,
    id: `${teamId}::${generateUID()}`,
    createdAt: now,
    createdBy: userId,
    tags: getTagsFromEntityMap(JSON.parse(proj.content).entityMap),
    teamId,
    userId,
    updatedAt: now
  }))

  return r
    .table('Task')
    .insert(seedTasks, {returnChanges: true})
    .do((result) => {
      return r.table('TaskHistory').insert(
        result('changes').map((change) => ({
          id: generateUID(),
          content: change('new_val')('content'),
          taskId: change('new_val')('id'),
          status: change('new_val')('status'),
          teamId: change('new_val')('teamId'),
          userId: change('new_val')('userId'),
          updatedAt: change('new_val')('updatedAt')
        }))
      )
    })
    .run()
}
