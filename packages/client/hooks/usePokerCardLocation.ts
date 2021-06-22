import {useMemo} from 'react'
import {PokerCards} from '../types/constEnums'
import getRotatedBBox from '../utils/getRotatedBBox'

// const MAX_SPREAD_DEG = PokerCards.TILT * 2
const usePokerCardLocation = (
  totalCards: number,
  tilt: number,
  maxHidden: number,
  radius: number,
  estimateAreaWidth: number
) => {
  return useMemo(() => {
    const maxSpreadDeg = tilt * 2
    const rotationPerCard = maxSpreadDeg / totalCards
    const initialRotation = ((totalCards - 1) / 2) * -rotationPerCard
    const {height, width} = getRotatedBBox(tilt, PokerCards.WIDTH, PokerCards.HEIGHT)
    const pxBelowFold = height * (1 - maxHidden)
    const yOffset = radius * Math.cos((initialRotation * Math.PI) / 180) - pxBelowFold
    const radians = (initialRotation * Math.PI) / 180
    const initialOffsetX = -radius * Math.sin(radians)
    const maxX = (estimateAreaWidth - width) / 2
    const maxSlide = Math.max(0, initialOffsetX - maxX)
    return {
      yOffset,
      rotationPerCard,
      initialRotation,
      maxSlide
    }
  }, [totalCards, tilt, maxHidden, radius, estimateAreaWidth])
}

export default usePokerCardLocation
