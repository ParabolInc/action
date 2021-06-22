import {useEffect, RefObject} from 'react'
import ResizeObserverPolyfill from 'resize-observer-polyfill'
import useEventCallback from './useEventCallback'

declare global {
  interface Window {
    ResizeObserver: {new (callback: ResizeObserverCallback): ResizeObserver}
  }
}

const ResizeObserver = window.ResizeObserver || (ResizeObserverPolyfill as {new (): ResizeObserver})

const useResizeObserver = (
  cb: ResizeObserverCallback,
  ref?: RefObject<HTMLDivElement | HTMLElement>
) => {
  const eventCb = useEventCallback(cb)
  useEffect(() => {
    if (!ref || !ref.current) return
    const resizeObserver = new ResizeObserver(eventCb)
    resizeObserver.observe(ref.current)
    return () => {
      resizeObserver.disconnect()
    }
  }, [ref, eventCb])
}

export default useResizeObserver
