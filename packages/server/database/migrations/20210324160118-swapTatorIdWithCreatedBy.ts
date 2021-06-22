import {R} from 'rethinkdb-ts'
export const up = async function(r: R) {
  try {
    await r
      .table('NewMeeting')
      .replace((row) =>
        row
          .merge({
            createdBy: row('defaultFacilitatorUserId')
          })
          .without('defaultFacilitatorUserId')
      )
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  await r
    .table('NewMeeting')
    .replace((row) =>
      row
        .merge({
          defaultFacilitatorUserId: row('createdBy')
        })
        .without('createdBy')
    )
    .run()
}
