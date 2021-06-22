import {useEffect, useRef} from 'react'
import BugController, {SpiderController} from '../utils/screenBugs/BugController'

const useScreenBugs = (isBuggy: boolean, meetingId: string) => {
  const bugRef = useRef<BugController>()
  const spiderRef = useRef<SpiderController>()
  useEffect(() => {
    if (!isBuggy) return
    const showBugs = new Date() < new Date('2021-Apr-30') || meetingId.charCodeAt(0) % 2 === 0
    if (!showBugs) return
    bugRef.current = new BugController({
      minBugs: 5,
      maxBugs: 8,
      mouseOver: 'flyoff',
      minDelay: 2000
    })
    spiderRef.current = new SpiderController({
      minBugs: 3,
      maxBugs: 4,
      mouseOver: 'die',
      minDelay: 2000
    })
    return () => {
      bugRef.current?.killAll()
      spiderRef.current?.killAll()
      setTimeout(() => {
        bugRef.current?.end()
        spiderRef.current?.end()
      }, 2000)
    }
  }, [isBuggy])
}

export default useScreenBugs
