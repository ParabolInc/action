export const up = async function(r) {
  try {
    await r
      .table('User')
      .indexCreate('updatedAt')
      .run()
    await r
      .table('User')
      .indexWait()
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function(r) {
  try {
    await r
      .table('User')
      .indexDrop('updatedAt')
      .run()
  } catch (e) {
    console.log(e)
  }
}
