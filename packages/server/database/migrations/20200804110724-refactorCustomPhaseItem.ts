import {R} from 'rethinkdb-ts'
exports.up = async (r: R) => {
  // this is going to be a BIG db hit, so delete the unnedded records first
  try {
    await r
      .table('RetroReflectionGroup')
      .filter({isActive: false})
      .delete()
      .run()
  } catch (e) {
    console.log(e)
  }
  try {
    await r({
      reflection: r.table('RetroReflection').update((row) => ({promptId: row('retroPhaseItemId')})),
      group: r.table('RetroReflectionGroup').update((row) => ({promptId: row('retroPhaseItemId')}))
    }).run()
  } catch (e) {
    console.log(e)
  }

  try {
    await r
      .table('CustomPhaseItem')
      .config()
      .update({name: 'ReflectPrompt'})
      .run()
  } catch (e) {
    console.log(e)
  }
  try {
    await r
      .table('ReflectPrompt')
      .indexCreate('templateId')
      .run()
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r: R) => {
  try {
    await r({
      reflection: r.table('RetroReflection').update((row) => ({retroPhaseItemId: row('promptId')})),
      group: r.table('RetroReflectionGroup').update((row) => ({retroPhaseItemId: row('promptId')}))
    }).run()
  } catch (e) {
    console.log(e)
  }
  try {
    await r
      .table('ReflectPrompt')
      .config()
      .update({name: 'CustomPhaseItem'})
      .run()
  } catch (e) {
    console.log(e)
  }
  try {
    await r
      .table('CustomPhaseItem')
      .indexDrop('templateId')
      .run()
  } catch (e) {
    console.log(e)
  }
}
