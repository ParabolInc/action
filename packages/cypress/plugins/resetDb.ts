// importing cypress for typescript defs
import 'cypress'

const getRethink = require('../../server/database/rethinkDriver').default
const db = require('../../server/db').default

interface DBOptions {
  source: string
  target: string
}
const resetDb = ({source, target}: DBOptions) => async () => {
  const r = await getRethink()
  // wipe out all records on the target
  const tableList: string[] = await r
    .db(target)
    .tableList()
    .run()
  const filteredTableList: string[] = tableList.filter((tableName) => tableName !== 'QueryMap')
  const tableDeletionPromises = filteredTableList.map((tableName) =>
    r
      .db(target)
      .table(tableName)
      .delete()
      .run()
  )
  await Promise.all(tableDeletionPromises)

  // add source docs to target db
  const results = await Promise.all(
    filteredTableList.map((t: any) =>
      r
        .db(target)
        .table(t)
        .insert(
          r
            .db(source)
            .table(t)
            .coerceTo('array')
        )
        .run()
    )
  )

  // prime user table
  const users = await r
    .db(target)
    .table('User')
    .run()
  await db.prime('User', users)

  return results
}

export default resetDb
