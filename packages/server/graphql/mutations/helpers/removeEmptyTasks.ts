import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import getRethink from '../../../database/rethinkDriver'

const removeEmptyTasks = async (meetingId: string) => {
  const r = await getRethink()
  const teamId = await r
    .table('NewMeeting')
    .get(meetingId)('teamId')
    .run()
  const createdTasks = await r
    .table('Task')
    .getAll(teamId, {index: 'teamId'})
    .filter({meetingId})
    .run()

  const removedTaskIds = createdTasks
    .map((task) => ({
      id: task.id,
      plaintextContent: extractTextFromDraftString(task.content)
    }))
    .filter(({plaintextContent}) => plaintextContent.length === 0)
    .map(({id}) => id)
  if (removedTaskIds.length > 0) {
    await r
      .table('Task')
      .getAll(r.args(removedTaskIds))
      .delete()
      .run()
  }
  return removedTaskIds
}

export default removeEmptyTasks
