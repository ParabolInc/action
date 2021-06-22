import {useEffect} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {GroupingKanbanColumn_reflectionGroups} from '~/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import useAtmosphere from './useAtmosphere'

interface SubColumnIdxs {
  [key: string]: number
}

const useSortNewReflectionGroup = (
  subColumnCount: number,
  subColumnIndexes: number[],
  reflectionGroups: GroupingKanbanColumn_reflectionGroups
) => {
  const atmosphere = useAtmosphere()

  const handleNewReflectionGroup = () => {
    if (!(subColumnCount > 1) || !reflectionGroups) return
    const subColumnIdxCounts = {} as SubColumnIdxs
    subColumnIndexes.forEach((idx) => (subColumnIdxCounts[idx] = 0))

    commitLocalUpdate(atmosphere, (store) => {
      reflectionGroups.forEach((group) => {
        const reflectionGroup = store.get(group.id)
        if (!reflectionGroup) return
        const currentSubColumnIdx = reflectionGroup.getValue('subColumnIdx') as number
        if (currentSubColumnIdx === undefined) {
          const smallestSubColumnCount = Math.min(...Object.values(subColumnIdxCounts))
          const smallestSubColumnIdx = Object.keys(subColumnIdxCounts).find(
            (key) => subColumnIdxCounts[key] === smallestSubColumnCount
          ) as string
          reflectionGroup.setValue(parseInt(smallestSubColumnIdx), 'subColumnIdx')
        } else {
          subColumnIdxCounts[currentSubColumnIdx] += 1
        }
      })
    })
  }
  useEffect(() => handleNewReflectionGroup(), [reflectionGroups])
}

export default useSortNewReflectionGroup
