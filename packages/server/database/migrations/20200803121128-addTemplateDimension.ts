import {R} from 'rethinkdb-ts'

export const up = async function(r: R) {
  try {
    await r.tableCreate('TemplateDimension').run()

    await r
      .table('TemplateDimension')
      .indexCreate('templateId')
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    await r.tableDrop('TemplateDimension').run()
  } catch (e) {
    console.log(e)
  }
}
