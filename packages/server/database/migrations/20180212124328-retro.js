import {RETRO_PHASE_ITEM} from 'parabol-client/utils/constants'

exports.up = async (r) => {
  let counter = 0
  try {
    await Promise.all([
      r.tableCreate('CustomPhaseItem').run(),
      r.tableCreate('NewMeeting').run(),
      r.tableCreate('RetroThought').run(),
      r.tableCreate('RetroThoughtGroup').run()
    ])
  } catch (e) {
    // noop
  }
  try {
    await Promise.all([
      r
        .table('CustomPhaseItem')
        .indexCreate('teamId')
        .run(),
      r
        .table('NewMeeting')
        .indexCreate('teamId')
        .run(),
      r
        .table('RetroThought')
        .indexCreate('meetingId')
        .run(),
      r
        .table('RetroThought')
        .indexCreate('thoughtGroupId')
        .run(),
      r
        .table('RetroThoughtGroup')
        .indexCreate('meetingId')
        .run()
      // r.table('RetroThoughtGroup').indexCreate('teamId'),
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
          type: RETRO_PHASE_ITEM,
          isActive: true,
          teamId,
          title: 'Positive',
          question: 'What’s working?'
        },
        {
          id: String(counter++),
          type: RETRO_PHASE_ITEM,
          isActive: true,
          teamId,
          title: 'Negative',
          question: 'Where did you get stuck?'
        },
        {
          id: String(counter++),
          type: RETRO_PHASE_ITEM,
          isActive: true,
          teamId,
          title: 'Change',
          question: 'What might we do differently next time?'
        }
      )
    })
    await r
      .table('CustomPhaseItem')
      .insert(inserts)
      .run()
  } catch (e) {
    // noop
  }
}

exports.down = async (r) => {
  try {
    await Promise.all([
      r.tableDrop('CustomPhaseItem').run(),
      r.tableDrop('NewMeeting').run(),
      r.tableDrop('RetroThought').run(),
      r.tableDrop('RetroThoughtGroup').run()
    ])
  } catch (e) {
    // noop
  }
}
