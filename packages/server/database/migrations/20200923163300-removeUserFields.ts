import {R} from 'rethinkdb-ts'
export const up = async function(r: R) {
  try {
    await r
      .table('User')
      .replace(r.row.without('lastSeenAtURL', 'connectedSockets'))
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r
      .table('User')
      .update({lastSeenAtURL: null, connectedSockets: []})
      .run()
  } catch (e) {
    console.log(e)
  }
}
