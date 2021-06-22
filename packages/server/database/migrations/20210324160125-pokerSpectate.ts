export const up = async function(r) {
  try {
    await r({
      teamMembers: r.table('TeamMember').update({isSpectatingPoker: false}),
      meetingMembers: r
        .table('MeetingMember')
        .filter({meetingType: 'poker'})
        .update({isSpectating: false})
    }).run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r) {
  try {
    await r({
      teamMembers: r.table('TeamMember').replace((row) => row.without('isSpectatingPoker')),
      meetingMembers: r
        .table('MeetingMember')
        .filter({meetingType: 'poker'})
        .replace((row) => row.without('isSpectating'))
    }).run()
  } catch (e) {
    console.log(e)
  }
}
