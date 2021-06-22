const normalizeRethinkDbResults = <T extends {id: string}>(
  keys: Readonly<string[]>,
  results: T[]
) => {
  const map = {} as {[key: string]: T}
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    map[result.id] = result
  }
  const mappedResults = [] as T[]
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    mappedResults.push(map[key])
  }
  return mappedResults
}

export default normalizeRethinkDbResults
