import getRethink from '../../packages/server/database/rethinkDriver'

async function renameDB() {
  const FROM = process.argv[2] || 'orgBackup'
  const TO = process.argv[3] || 'actionDevelopment'
  const r = await getRethink()
  try {
    await r.dbDrop(TO).run()
  } catch (e) {
    // empty
  }
  await r.dbCreate(TO).run()
  const list = await r
    .db(FROM)
    .tableList()
    .run()
  const promises = list.map((table) =>
    r
      .db(FROM)
      .table(table)
      .config()
      .update({
        db: TO
      } as any)
      .run()
  )
  await Promise.all(promises)
  console.log('Move to actionDevelopment complete!')
  r.getPoolMaster().drain()
}

renameDB()
