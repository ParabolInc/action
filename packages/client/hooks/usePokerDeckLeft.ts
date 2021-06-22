import {RefObject, useLayoutEffect, useState} from 'react'
import {DiscussionThreadEnum, PokerCards} from '../types/constEnums'
import useResizeObserver from './useResizeObserver'

const usePokerDeckLeft = (
  deckRef: RefObject<HTMLDivElement>,
  totalCards: number,
  showSidebar: boolean
) => {
  const [left, setLeft] = useState(0)
  const adjustLeft = () => {
    const totalWidth = deckRef.current!.clientWidth
    const deckWidth = PokerCards.WIDTH + (PokerCards.WIDTH - PokerCards.OVERLAP) * (totalCards - 1)
    setLeft((totalWidth - deckWidth - (showSidebar ? DiscussionThreadEnum.WIDTH : 0)) / 2)
  }
  useLayoutEffect(adjustLeft, [])
  useResizeObserver(adjustLeft, deckRef)
  return left
}

export default usePokerDeckLeft
