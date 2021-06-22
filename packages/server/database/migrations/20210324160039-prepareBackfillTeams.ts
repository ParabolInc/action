export const up = async function(r) {
  try {
    // ensure createdAt field
    await r
      .table('Team')
      .filter((row) => row.hasFields('createdAt').not())
      .update({createdAt: new Date()})
      .run()
    // ensure updatedAt field
    await r
      .table('Team')
      .filter((row) => row.hasFields('updatedAt').not())
      .update({updatedAt: r.row('createdAt')})
      .run()
    await r
      .table('Team')
      .indexCreate('updatedAt')
      .run()
    await r
      .table('Team')
      .indexWait()
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r) {
  try {
    await r
      .table('Team')
      .indexDrop('updatedAt')
      .run()
  } catch (e) {
    console.log(e)
  }
}
