import {RefObject, useLayoutEffect, useState} from 'react'
import {PokerCards} from '../types/constEnums'
import useResizeObserver from './useResizeObserver'

const usePokerAvatarOverflow = (rowRef: RefObject<HTMLDivElement>) => {
  const avatarOverlap = 10
  const [maxAvatars, setMaxAvatars] = useState(0)
  const checkOverflow = () => {
    const {current: el} = rowRef
    if (!el) return
    const {clientWidth: totalWidth} = el
    const lappedAvatarWidth = PokerCards.AVATAR_WIDTH - avatarOverlap
    const maxAvatars = Math.floor((totalWidth - PokerCards.AVATAR_WIDTH) / lappedAvatarWidth)
    setMaxAvatars(maxAvatars)
  }
  useLayoutEffect(checkOverflow, [])
  useResizeObserver(checkOverflow, rowRef)
  return maxAvatars
}

export default usePokerAvatarOverflow
