type FilterFn = (record: Record) => boolean | null | undefined | void
interface Options {
  isPlural: boolean
}

interface Record {
  __id: string
  __typename: string
  [field: string]: any
}

/*
 * Goes through the sink, then the base looking for 1 or more records that match the filterFn
 * */

// overloading the function because return type is guaranteed based on options
function getCachedRecord(
  store: any,
  filterFn: FilterFn,
  options?: {isPlural: false} & Options
): Record
function getCachedRecord(
  store: any,
  filterFn: FilterFn,
  options: {isPlural: true} & Options
): Record[]
function getCachedRecord(
  store: any,
  filterFn: FilterFn,
  options: Options = {isPlural: false}
): Record[] | Record {
  const sources = store.__recordSource.__mutator.__sources
  const filteredRecords: Record[] = []
  for (let ss = 0; ss < sources.length; ss++) {
    const source = sources[ss]
    const records = source._records
    // relay again does something silly & nests their source in a source because they can't figure out optmistic updating
    let optimisticRecords
    if (!records) {
      optimisticRecords = {
        ...source._base._records,
        ...source._sink._records
      }
    }
    const allRecords = records || optimisticRecords
    const keys = Object.keys(allRecords)
    for (let ii = 0; ii < keys.length; ii++) {
      const key = keys[ii]
      const record = allRecords[key]
      if (filterFn(record)) {
        if (!options.isPlural) return record
        filteredRecords.push(record)
      }
    }
  }
  return filteredRecords
}

export default getCachedRecord
