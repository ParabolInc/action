import getRethink from './rethinkDriver'

export default async function cloneProdToDev() {
  const r = await getRethink()
  const DESTINATION = 'cypress'


  // create the DB
  try {
    await r.dbDrop(DESTINATION).run()
  } catch (e) {
    // db never existed. all good
  }
  await r.dbCreate(DESTINATION).run()
  // create all the tables
  await r.tableList()
    .forEach((table) => {
      return r.db(DESTINATION).tableCreate(table)
    })
    .run()

  // now create all the indexes
  await r.tableList()
    .forEach((table) => {
      return r
        .table(table)
        .indexStatus()
        .forEach((idx) => {
          return r
            .db(DESTINATION)
            .table(table)
            .indexCreate(idx('index'), idx('function'), {
              geo: idx('geo'),
              multi: idx('multi')
            })
        })
    })
    .run()



  try {
    await r.tableList().forEach((table) => {
      return r.db(DESTINATION).table(table).insert(r.table(table))
    }).run()
  } catch (e) {
    console.log('ERR 1', e)
  }

  console.log('Move to cypress complete!')
  r.getPoolMaster().drain()
}
