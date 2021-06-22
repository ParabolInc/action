import {useEffect, useState} from 'react'
import useEventCallback from './useEventCallback'

const useControlBarLeft = (): number => {
  const [innerWidth, setInnerWidth] = useState(window.innerWidth)
  const updateInnerWidth = useEventCallback(() => {
    setInnerWidth(window.innerWidth)
  })
  useEffect(() => {
    window.addEventListener('resize', updateInnerWidth, {passive: true})
    return () => {
      window.removeEventListener('resize', updateInnerWidth)
    }
  }, [innerWidth])

  return innerWidth
}

export default useControlBarLeft
