import {R} from 'rethinkdb-ts'
export const up = async function(r: R) {
  try {
    const samlWithId = await r
      .table('SAML')
      .map((row) => {
        return {
          id: row('domain'),
          domain: row('domain'),
          url: row('url'),
          metadata: row('metadata')
        }
      })
      .run()

    await r
      .table('SAML')
      .insert(samlWithId, {conflict: 'replace'})
      .run()

    await r
      .table('SAML')
      .filter((row) => row('id').ne(row('domain')))
      .delete()
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r: R) {
  try {
    const samlWithoutId = await r
      .table('SAML')
      .map((row) => {
        return {
          domain: row('domain'),
          url: row('url'),
          metadata: row('metadata')
        }
      })
      .run()

    await r
      .table('SAML')
      .insert(samlWithoutId)
      .run()
  } catch (e) {
    console.log(e)
  }
}
