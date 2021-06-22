import {R} from 'rethinkdb-ts'
export const up = async function (r: R) {
  try {
    await Promise.all([
      r.table('SAML').indexCreate('domains', {multi: true}).run(),
      r.table('SAML').indexDrop('domain')
    ])
  } catch (e) {
    // noop
  }
  try {
    await r
      .table('SAML')
      .replace((row) => row.merge({domains: [row('domain').add('.com')]}).without('domain', 'cert'))
      .run()
  } catch (e) {
    // noop
  }
}

export const down = async function (r: R) {
  try {
    await Promise.all([
      r.table('SAML').indexCreate('domain').run(),
      r.table('SAML').indexDrop('domains')
    ])
  } catch (e) {
    // noop
  }
  try {
    await r
      .table('SAML')
      .replace((row) =>
        row.merge({domain: row('domain').nth(0).split('.').nth(0)}).without('domains')
      )
      .run()
  } catch (e) {
    // noop
  }
}
