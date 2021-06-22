import {R} from 'rethinkdb-ts'

export const up = async function(r: R) {
  try {
    await r.tableCreate('TemplateScale').run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r.tableDrop('TemplateScale').run()
  } catch (e) {
    console.log(e)
  }
}
