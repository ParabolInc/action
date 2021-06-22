import Reactji from '../database/types/Reactji'

const getGroupedReactjis = (reactjis: Reactji[], viewerId: string, idPrefix: string) => {
  const agg = {}
  for (let i = 0; i < reactjis.length; i++) {
    const {id, userId} = reactjis[i]
    const guid = `${idPrefix}:${id}`
    const isViewerReactji = viewerId === userId
    const record = agg[guid]
    if (!record) {
      agg[guid] = {id: guid, count: 1, isViewerReactji}
    } else {
      record.count++
      record.isViewerReactji = record.isViewerReactji || isViewerReactji
    }
  }
  return Object.values(agg) as Reactji[]
}

export default getGroupedReactjis
