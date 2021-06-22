import {useMemo} from 'react'
import {Threshold} from '../types/constEnums'

const useUnusedRecords = (
  storyEdges: ReadonlyArray<{readonly node: {readonly id: string}}>,
  usedServiceTaskIds: Set<string>
): [string[], boolean | null] => {
  return useMemo(() => {
    const unusedServiceTaskIds = [] as string[]
    storyEdges.forEach(({node}) => {
      if (!usedServiceTaskIds.has(node.id)) unusedServiceTaskIds.push(node.id)
    })
    const allSelected =
      unusedServiceTaskIds.length === 0 || usedServiceTaskIds.size === Threshold.MAX_POKER_STORIES ? true : unusedServiceTaskIds.length === storyEdges.length ? false : null
    return [unusedServiceTaskIds, allSelected]
  }, [storyEdges, usedServiceTaskIds])
}

export default useUnusedRecords
