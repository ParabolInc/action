import {Threshold} from '../types/constEnums'
import plural from './plural'

const getSelectAllTitle = (availableStoryCount: number, usedServiceTaskIdCount: number, storyLabel: string) => {
  const availableCountToAdd = Threshold.MAX_POKER_STORIES - usedServiceTaskIdCount
  const selectableCount = Math.min(availableCountToAdd, availableStoryCount)
  const adjective = selectableCount === availableStoryCount ? 'all' : 'next'
  const selectLabel = `Select ${adjective} ${selectableCount} ${plural(selectableCount, storyLabel)}`
  return selectableCount === 0 ? 'Deselect all' : selectLabel
}

export default getSelectAllTitle
