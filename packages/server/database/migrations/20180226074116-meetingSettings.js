import {
  ACTION,
  AGENDA_ITEMS,
  CHECKIN,
  DISCUSS,
  FIRST_CALL,
  GROUP,
  LAST_CALL,
  LOBBY,
  RETROSPECTIVE,
  SUMMARY,
  UPDATES,
  VOTE
} from 'parabol-client/utils/constants'

exports.up = async (r) => {
  let counter = 0
  counter++
  try {
    await Promise.all([r.tableCreate('MeetingSettings').run()])
  } catch (e) {
    // noop
  }
  try {
    await Promise.all([
      r
        .table('MeetingSettings')
        .indexCreate('teamId')
        .run()
    ])
  } catch (e) {
    // noop
  }
  try {
    const teamIds = await r
      .table('Team')('id')
      .run()
    const inserts = []
    teamIds.forEach((teamId) => {
      inserts.push(
        {
          id: String(counter++),
          meetingType: RETROSPECTIVE,
          teamId,
          phases: [LOBBY, CHECKIN, 'think', GROUP, VOTE, DISCUSS, SUMMARY]
        },
        {
          id: String(counter++),
          meetingType: ACTION,
          teamId,
          phases: [LOBBY, CHECKIN, UPDATES, FIRST_CALL, AGENDA_ITEMS, LAST_CALL, SUMMARY]
        }
      )
    })
    await r
      .table('MeetingSettings')
      .insert(inserts)
      .run()
  } catch (e) {
    // noop
  }
}

exports.down = async (r) => {
  try {
    await Promise.all([r.tableDrop('MeetingSettings').run()])
  } catch (e) {
    // noop
  }
}
