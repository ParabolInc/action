import {RefObject, useMemo, useState} from 'react'
import {commitLocalUpdate} from 'react-relay'
import getBBox from '~/components/RetroReflectPhase/getBBox'
import {Breakpoint, ElementHeight, ElementWidth} from '~/types/constEnums'
import {GroupingKanbanColumn_reflectionGroups} from '~/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import useAtmosphere from './useAtmosphere'
import useBreakpoint from './useBreakpoint'
import useResizeObserver from './useResizeObserver'
import useSortNewReflectionGroup from './useSortNewReflectionGroup'

const DEFAULT_EXPANDED_SUB_COLUMNS = 2
const DEFAULT_SUB_COLUMNS = 1
const COLUMN_MARGIN = 16
const COLUMN_WIDTH = ElementWidth.REFLECTION_COLUMN + COLUMN_MARGIN

const useSubColumns = (
  columnBodyRef: RefObject<HTMLDivElement>,
  phaseRef: RefObject<HTMLDivElement>,
  reflectPromptsCount: number,
  reflectionGroups: GroupingKanbanColumn_reflectionGroups,
  columnsRef: RefObject<HTMLDivElement>
) => {
  const atmosphere = useAtmosphere()
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const sortSubColumns = (maxSubColumns: number) => {
    commitLocalUpdate(atmosphere, (store) => {
      let nextSubColumnIdx = 0
      reflectionGroups.forEach((group) => {
        const reflectionGroup = store.get(group.id)
        if (!reflectionGroup) return
        reflectionGroup.setValue(nextSubColumnIdx, 'subColumnIdx')
        if (nextSubColumnIdx === maxSubColumns - 1) nextSubColumnIdx = 0
        else nextSubColumnIdx += 1
      })
    })
  }
  const getMaxSubColumnCount = () => {
    if (!columnBodyRef.current || !columnsRef.current || !phaseRef.current)
      return DEFAULT_EXPANDED_SUB_COLUMNS
    const columnBodyEl = columnBodyRef.current
    const subColumnCountWithoutScroll = Math.ceil(
      columnBodyEl.scrollHeight / (columnBodyEl.clientHeight - ElementHeight.REFLECTION_CARD)
    )
    const maxSubColumnCount = Math.max(subColumnCountWithoutScroll, DEFAULT_EXPANDED_SUB_COLUMNS)
    const columnsWidth = columnsRef.current.clientWidth
    const phaseWidth = phaseRef.current.clientWidth
    const maxSubColumnsInPhase = Math.floor(phaseWidth / COLUMN_WIDTH)
    const scrollbarExists = phaseWidth < columnsWidth
    if (!scrollbarExists) {
      const scrollbarWillExist = willScrollbarExist(maxSubColumnCount, columnsWidth, phaseWidth)
      // if expanding to maxWidth creates a horizontal scrollbar, check if DEFAULT_EXPANDED_SUB_COLUMNS does not
      if (scrollbarWillExist && maxSubColumnCount > DEFAULT_EXPANDED_SUB_COLUMNS) {
        const scrollbarWillStillExist = willScrollbarExist(
          DEFAULT_EXPANDED_SUB_COLUMNS,
          columnsWidth,
          phaseWidth
        )
        if (!scrollbarWillStillExist) return DEFAULT_EXPANDED_SUB_COLUMNS
      }
    }
    return Math.min(maxSubColumnCount, maxSubColumnsInPhase)
  }

  const [subColumnCount, setSubColumnCount] = useState(() => {
    const phaseBBox = getBBox(phaseRef.current)
    if (!phaseBBox || !isDesktop) return DEFAULT_SUB_COLUMNS
    const {width: phaseWidth} = phaseBBox
    const maxSubColumnsInPhase = Math.floor(phaseWidth! / COLUMN_WIDTH)
    const maxSubColumnsPerColumn = Math.max(
      Math.floor(maxSubColumnsInPhase / reflectPromptsCount),
      DEFAULT_SUB_COLUMNS
    )
    const maxSubColumnCount = getMaxSubColumnCount()
    const colCount = Math.min(maxSubColumnCount, maxSubColumnsPerColumn)
    sortSubColumns(colCount)
    return colCount
  })
  const subColumnIndexes = useMemo(() => {
    return [...Array(subColumnCount).keys()]
  }, [subColumnCount])

  useSortNewReflectionGroup(subColumnCount, subColumnIndexes, reflectionGroups)

  const willScrollbarExist = (
    newSubColumnCount: number,
    columnsWidth: number,
    phaseWidth: number
  ) => {
    const newColumnWidth = COLUMN_WIDTH * newSubColumnCount
    return columnsWidth + newColumnWidth - subColumnCount * COLUMN_WIDTH > phaseWidth
  }

  const toggleWidth = () => {
    const maxSubColumnCount = getMaxSubColumnCount()
    if (subColumnCount === DEFAULT_SUB_COLUMNS) {
      setSubColumnCount(maxSubColumnCount)
      sortSubColumns(maxSubColumnCount)
    } else setSubColumnCount(DEFAULT_SUB_COLUMNS)
  }

  useResizeObserver(() => {
    if (!isDesktop) {
      setSubColumnCount(DEFAULT_SUB_COLUMNS)
    }
  }, phaseRef)

  return [subColumnCount > DEFAULT_SUB_COLUMNS, subColumnIndexes, toggleWidth] as const
}

export default useSubColumns
