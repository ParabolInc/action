import {RefObject, useEffect, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

const usePokerDeckLeftEdge = (estimateAreaRef: RefObject<HTMLDivElement>, isVoting: boolean) => {
  const [estimateAreaWidth, setEstimateAreaWidth] = useState(0)
  const adjustLeft = () => {
    const el = estimateAreaRef.current
    if (!el) return
    const {clientWidth} = el
    setEstimateAreaWidth(clientWidth)
  }
  useLayoutEffect(adjustLeft, [estimateAreaRef])
  useResizeObserver(adjustLeft, estimateAreaRef)
  const [showTransition, setShowTransition] = useState(true)
  useEffect(() => {
    const show = !(estimateAreaWidth === 0 && !isVoting)
    setShowTransition(show)
  }, [estimateAreaWidth])
  // showTransition is to prevent the collapsed deck from moving from center to right edge on refresh
  return [estimateAreaWidth, showTransition] as const
}

export default usePokerDeckLeftEdge
