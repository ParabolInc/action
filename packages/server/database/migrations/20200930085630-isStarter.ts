import {R} from 'rethinkdb-ts'
export const up = async function(r: R) {
  const starters = [
    'sailboatTemplate',
    'startStopContinueTemplate',
    'workingStuckTemplate',
    'fourLsTemplate',
    'gladSadMadTemplate'
  ]
  try {
    await r
      .table('MeetingTemplate')
      .getAll(r.args(starters))
      .update({isStarter: true})
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  const starters = [
    'sailboatTemplate',
    'startStopContinueTemplate',
    'workingStuckTemplate',
    'fourLsTemplate',
    'gladSadMadTemplate'
  ]
  try {
    await r
      .table('MeetingTemplate')
      .getAll(r.args(starters))
      .replace((row) => row.without('isStarter'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
