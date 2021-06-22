import {useEffect, useRef} from 'react'
import useForceUpdate from './useForceUpdate'

const useInterval = (duration: number, iters: number) => {
  const countRef = useRef(0)
  const forceUpdate = useForceUpdate()
  useEffect(() => {
    const interval = window.setInterval(() => {
      countRef.current++
      forceUpdate()
      if (countRef.current >= iters) {
        window.clearInterval(interval)
      }
    }, duration)
    return () => {
      window.clearInterval(interval)
    }
  }, [duration, iters])
  return countRef.current
}

export default useInterval
