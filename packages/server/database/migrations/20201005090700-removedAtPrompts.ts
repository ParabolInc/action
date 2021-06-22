import {awaitExpression} from 'jscodeshift'
import {R} from 'rethinkdb-ts'
export const up = async function(r: R) {
  const now = new Date()
  try {
    await r
      .table('ReflectPrompt')
      .update((row) => ({removedAt: r.branch(row('isActive').eq(true), null, now)}))
      .run()

    await r
      .table('ReflectPrompt')
      .replace(r.row.without('isActive'))
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r
      .table('ReflectPrompt')
      .update((row) => ({isActive: r.branch(row('removedAt').eq(null), true, false)}))
      .run()

    await r
      .table('ReflectPrompt')
      .replace(r.row.without('removedAt'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
