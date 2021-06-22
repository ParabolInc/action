
import {RefObject, useEffect} from 'react'

const usePokerZIndexOverride = (isTop: boolean, cardRef: RefObject<HTMLDivElement>, isExpanding: boolean, collapseDuration: number, expandDuration: number) => {
  useEffect(() => {
    if (!isTop) return
    const el = cardRef.current
    if (!el) return
    const {style} = el

    if (isExpanding) {
      style.zIndex = '1'
      setTimeout(() => {
        style.zIndex = ''
      }, expandDuration)
    } else {
      setTimeout(() => {
        style.zIndex = '1'
        setTimeout(() => {
          style.zIndex = ''
        }, collapseDuration)
      }, expandDuration)
    }
  }, [isTop])
}

export default usePokerZIndexOverride
