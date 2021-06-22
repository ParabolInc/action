import {R} from 'rethinkdb-ts'
export const up = async function (r: R) {
  try {
    await r
      .table('TemplateScale')
      .update((row) => ({
        values: row('values').map((scaleValue) => scaleValue.without('isSpecial'))
      }))
      .run()
  } catch (e) {
    // noop
  }
}

export const down = async function (r: R) {
  const specials = ['?', 'Pass']
  try {
    await r
      .table('TemplateScale')
      .update((row) => ({
        values: row('values').map((scaleValue) => {
          return r.branch(
            r(specials).contains(scaleValue('label')),
            scaleValue.merge({
              isSpecial: true
            }),
            scaleValue
          )
        })
      }))
      .run()
  } catch (e) {
    // noop
  }
}
