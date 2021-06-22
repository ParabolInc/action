import {
  COMPLETED_ACTION_MEETING,
  COMPLETED_RETRO_MEETING,
  JOINED_PARABOL
} from '../../graphql/types/TimelineEventTypeEnum'

exports.up = async (r) => {
  let counter = 432
  try {
    await r.tableCreate('TimelineEvent').run()
  } catch (e) { }
  try {
    await r
      .table('TimelineEvent')
      .indexCreate('userIdCreatedAt', (row) => [row('userId'), row('createdAt')])
      .run()
  } catch (e) { }

  const {users, completedActionMeetings, completedRetroMeetings} = await r({
    users: r
      .table('User')
      .pluck('id', 'createdAt', 'tms')
      .coerceTo('array'),
    completedActionMeetings: r
      .table('Meeting')
      .pluck('id', 'teamId', 'endedAt')
      .merge((meeting) => ({
        type: COMPLETED_ACTION_MEETING,
        orgId: r
          .table('Team')
          .get(meeting('teamId'))('orgId')
          .default(null)
      }))
      .filter((meeting) => meeting('orgId').ne(null))
      .coerceTo('array'),
    completedRetroMeetings: r
      .table('NewMeeting')
      .pluck('id', 'teamId', 'endedAt')
      .merge((meeting) => ({
        type: COMPLETED_RETRO_MEETING,
        orgId: r
          .table('Team')
          .get(meeting('teamId'))('orgId')
          .default(null)
      }))
      .filter((meeting) => meeting('orgId').ne(null))
      .coerceTo('array')
  }).run()

  const completedMeetings = [...completedActionMeetings, ...completedRetroMeetings]

  // account created
  const events = []
  events.push(
    ...users.map((user) => {
      return {
        id: String(counter++),
        createdAt: user.createdAt,
        interactionCount: 0,
        seenCount: 0,
        type: JOINED_PARABOL,
        userId: user.id
      }
    })
  )

  // meetings completed
  const usersByTeamId = {}
  users.forEach((user) => {
    if (!user.tms) return
    user.tms.forEach((teamId) => {
      usersByTeamId[teamId] = usersByTeamId[teamId] || []
      usersByTeamId[teamId].push(user.id)
    })
  })

  completedMeetings.forEach((meeting) => {
    const userIds = usersByTeamId[meeting.teamId]
    if (!userIds) return
    const userEvents = userIds.map((userId) => ({
      id: String(counter++),
      createdAt: meeting.endedAt,
      interactionCount: 0,
      seenCount: 0,
      type: meeting.type,
      userId,
      teamId: meeting.teamId,
      orgId: meeting.orgId,
      meetingId: meeting.id
    }))
    events.push(...userEvents)
  })
  await r
    .table('TimelineEvent')
    .insert(events)
    .run()
}

exports.down = async (r) => {
  try {
    await r.tableDrop('TimelineEvent').run()
  } catch (e) { }
}
