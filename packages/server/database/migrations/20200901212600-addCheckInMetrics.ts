import {R} from 'rethinkdb-ts'
import {MeetingTypeEnum} from 'parabol-client/types/graphql'

export const up = async function(r: R) {
  try {
    const getThreadIds = (row) =>
      r.args(
        r
          .table('AgendaItem')
          .getAll(row('id'), {index: 'meetingId'})
          .map((row) => row('id'))
          .coerceTo('array') as any
      )
    await r
      .table('NewMeeting')
      .filter({meetingType: MeetingTypeEnum.action})
      .filter((row) =>
        row('endedAt')
          .default(null)
          .ne(null)
      )
      .update(
        (row) => ({
          commentCount: r
            .table('Comment')
            .getAll(getThreadIds(row), {index: 'threadId'})
            .count()
            .default(0),
          agendaItemCount: r
            .table('AgendaItem')
            .getAll(row('id'), {index: 'meetingId'})
            .count()
            .default(0)
        }),
        {nonAtomic: true}
      )
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r
      .table('NewMeeting')
      .filter({meetingType: MeetingTypeEnum.action})
      .replace((row) => row.without('commentCount', 'agendaItemCount'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
