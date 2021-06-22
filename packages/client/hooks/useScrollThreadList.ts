import {RefObject, useEffect, useLayoutEffect, useRef} from 'react'
import useInitialRender from '~/hooks/useInitialRender'

const useScrollThreadList = (
  threadables: readonly any[],
  editorRef: RefObject<HTMLTextAreaElement>,
  wrapperRef: RefObject<HTMLDivElement>,
  preferredNames: string[] | null,
) => {
  const isInit = useInitialRender()
  // if we're at or near the bottom of the scroll container
  // and the body is the active element
  // then scroll to the bottom whenever threadables changes
  const oldScrollHeightRef = useRef(0)

  useLayoutEffect(() => {
    const {current: el} = wrapperRef
    if (!el) return

    const {scrollTop, scrollHeight, clientHeight} = el
    if (isInit) {
      if (el.scrollTo) {
        el.scrollTo({top: scrollHeight})
      } else {
        el.scrollTop = el.scrollHeight
      }
      return
    }
    // get the element for the draft-js el or android fallback
    const edEl = (editorRef.current as any)?.editor || editorRef.current

    // if i'm writing something or i'm almost at the bottom or i've reduced the
    // wrapper height, i.e. closed video in poker meeting, go to the bottom
    if (
      document.activeElement === edEl ||
      scrollTop + clientHeight > oldScrollHeightRef.current - 20 
    ) {
      setTimeout(() => {
        if (el.scrollTo) {
          el.scrollTo({top: scrollHeight, behavior: 'smooth'})
        } else {
          el.scrollTop = el.scrollHeight
        }
        // the delay is required for new task cards, not sure why height is determined async
      }, 50)
    }
  }, [isInit, threadables, preferredNames])
  useEffect(() => {
    oldScrollHeightRef.current = wrapperRef.current?.scrollHeight ?? 0
  }, [threadables])
}

export default useScrollThreadList
