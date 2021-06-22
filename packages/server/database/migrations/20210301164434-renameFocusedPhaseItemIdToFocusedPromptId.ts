import {R} from 'rethinkdb-ts'
export const up = async function(r: R) {
  try {
    await r
      .table('NewMeeting')
      .filter({meetingType: 'retrospective'})
      .update({
        phases: r.row('phases').map((phase) => {
          return r.branch(
            phase('focusedPhaseItemId')
              .default(null)
              .ne(null),
            phase
              .without('focusedPhaseItemId')
              .merge({focusedPromptId: phase('focusedPhaseItemId')}),
            phase
          )
        })
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r
      .table('NewMeeting')
      .filter({meetingType: 'retrospective'})
      .update({
        phases: r.row('phases').map((phase) => {
          return r.branch(
            phase('focusedPromptId')
              .default(null)
              .ne(null),
            phase.without('focusedPromptId').merge({focusedPhaseItemId: phase('focusedPromptId')}),
            phase
          )
        })
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}
