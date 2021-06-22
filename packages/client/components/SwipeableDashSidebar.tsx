import styled from '@emotion/styled'
import React, {ReactNode, useCallback, useEffect, useState} from 'react'
import useEventCallback from '~/hooks/useEventCallback'
import usePortal from '../hooks/usePortal'
import {DECELERATE} from '../styles/animation'
import {navDrawerShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {DiscussionThreadEnum, NavSidebar, ZIndex} from '../types/constEnums'
import hideBodyScroll from '../utils/hideBodyScroll'
import PlainButton from './PlainButton/PlainButton'

const PEEK_WIDTH = 20

const SidebarAndScrim = styled('div')<{isRightDrawer: boolean; SIDEBAR_WIDTH: number}>(
  ({isRightDrawer, SIDEBAR_WIDTH}) => ({
    position: 'absolute',
    left: isRightDrawer ? undefined : -SIDEBAR_WIDTH,
    right: isRightDrawer ? PEEK_WIDTH : undefined,
    top: 0
  })
)
const Scrim = styled('div')<{x: number; SIDEBAR_WIDTH: number}>(({x, SIDEBAR_WIDTH}) => ({
  background: PALETTE.SLATE_900_32,
  height: '100%',
  left: 0,
  opacity: x / SIDEBAR_WIDTH,
  position: 'fixed',
  pointerEvents: x > 0 ? undefined : 'none',
  transition: `opacity 200ms ${DECELERATE}`,
  width: '100%',
  zIndex: ZIndex.SIDEBAR
}))

const SidebarAndHandle = styled('div')<{x: number; isRightDrawer: boolean}>(
  ({x, isRightDrawer}) => ({
    display: 'flex',
    flexDirection: isRightDrawer ? 'row-reverse' : 'row',
    position: 'fixed',
    transform: `translateX(${isRightDrawer ? -x : x}px)`,
    transition: `transform 200ms ${DECELERATE}`,
    zIndex: ZIndex.SIDEBAR
  })
)
const Sidebar = styled('div')<{x: number; HYSTERESIS_THRESH: number}>(({x, HYSTERESIS_THRESH}) => ({
  boxShadow: x > 0 ? navDrawerShadow : undefined,
  height: '100vh',
  pointerEvents: x > HYSTERESIS_THRESH ? undefined : 'none'
}))

const SwipeHandle = styled(PlainButton)({
  width: PEEK_WIDTH
})

const updateSpeed = (clientX: number) => {
  const movementX = swipe.lastX - clientX
  const dx = Math.abs(movementX)
  const now = performance.now()
  const duration = now - swipe.lastMove
  const speed = dx / duration
  swipe.speed = swipe.speed * 0.4 + speed * 0.6
  swipe.lastMove = now
  swipe.lastX = clientX
}

const updateIsSwipe = (clientX: number, clientY: number, isRightDrawer: boolean) => {
  const movementX = swipe.startX - clientX
  const movementY = swipe.startY - clientY
  const dx = Math.abs(movementX)
  const dy = Math.abs(movementY)
  const rads = -Math.atan(movementX / dy)
  if (dx > UNCERTAINTY_THRESHOLD || dy > UNCERTAINTY_THRESHOLD) {
    const swipingLeft = rads <= -MIN_ARC_RADS
    const swipingRight = rads >= MIN_ARC_RADS
    // if it's open & sidebar is on the right & it's a swipe to the right || it's closed
    // & sidebar is on the right & it's a swipe to the left. Vice versa for left sidebar
    swipe.isSwipe = swipe.isOpen
      ? isRightDrawer
        ? swipingRight
        : swipingLeft
      : isRightDrawer
        ? swipingLeft
        : swipingRight
  }
}

const HYSTERESIS = 0.55 // how far must it be pulled out to stay out (0 -1)
const MIN_ARC_ANGLE = 30 // how sloppy can the pull be. 0 means everything is a swipe, 90 degrees means only perfectly horizontal drags are a swipe (0 - 90)
const MIN_ARC_RADS = (MIN_ARC_ANGLE / 180) * Math.PI
const MIN_SPEED = 0.3 // faster than this and it's a fling (0 - 5+)
const UNCERTAINTY_THRESHOLD = 3 // pixels to move along 1 plane until we determine intent

const swipe = {
  isOpen: false,
  downCaptured: false, // true if a touchstart or mousedown event has fired and the end/up event has not fired
  peekTimeout: undefined as undefined | number,
  lastMove: 0, // last time a move event was fired
  lastX: 0, // last position during a move event
  speed: 0, // the mouse speed based on a moving average
  startX: 0, // the X coord at the mouse/touch start
  startY: 0, // the Y coord at the mouse/touch start
  isSwipe: null as null | boolean, // null if unsure true if we're confident the intent is to swipe
  showBodyScroll: null as (() => void) | null // thunk to call to unlock body scrolling
}

interface Props {
  children: ReactNode
  isOpen: boolean
  isRightDrawer?: boolean
  onToggle: () => void
}

const SwipeableDashSidebar = (props: Props) => {
  const {children, isOpen, isRightDrawer = false, onToggle} = props
  const {portal, openPortal} = usePortal({
    allowScroll: true,
    noClose: true
  })
  const [x, setX] = useState(0)
  const SIDEBAR_WIDTH: number = isRightDrawer ? DiscussionThreadEnum.WIDTH : NavSidebar.WIDTH
  const HYSTERESIS_THRESH = HYSTERESIS * SIDEBAR_WIDTH

  useEffect(
    () => {
      openPortal()
      return () => {
        window.clearTimeout(swipe.peekTimeout)
        hideSidebar()
      }
    },
    [
      /* eslint-disable-line react-hooks/exhaustive-deps*/
    ]
  )

  const hideSidebar = useCallback(() => {
    setX(0)
    swipe.showBodyScroll && swipe.showBodyScroll()
  }, [])

  const showSidebar = useCallback(() => {
    setX(SIDEBAR_WIDTH)
    swipe.showBodyScroll = hideBodyScroll()
  }, [])

  useEffect(() => {
    if (isOpen !== swipe.isOpen) {
      swipe.isOpen = isOpen
      isOpen ? showSidebar() : hideSidebar()
    }
  }, [isOpen, hideSidebar, showSidebar])

  const onMouseUp = useEventCallback((e: MouseEvent | TouchEvent) => {
    window.clearTimeout(swipe.peekTimeout)
    const eventType = e.type === 'mouseup' ? 'mousemove' : 'touchmove'
    document.removeEventListener(eventType, onMouseMove)
    const movementX = swipe.lastX - swipe.startX
    const {isOpen: nextIsOpen} = swipe
    const isOpening = movementX > 0 !== nextIsOpen
    const isFling = swipe.speed >= MIN_SPEED && isOpening
    if (isFling) {
      onToggle()
    } else if (x > HYSTERESIS_THRESH) {
      if (!nextIsOpen) {
        onToggle()
      } else {
        showSidebar()
      }
    } else {
      if (nextIsOpen) {
        onToggle()
      } else {
        hideSidebar()
      }
    }
    swipe.downCaptured = false
    // TODO can remove?
    // setTimeout(() => {
    swipe.isSwipe = null
    swipe.speed = 0
    // })
  })

  const onMouseMove = useEventCallback((e: MouseEvent | TouchEvent) => {
    const event = e.type === 'touchmove' ? (e as TouchEvent).touches[0] : (e as MouseEvent)
    const {clientX, clientY} = event
    if (swipe.isSwipe === null) {
      // they don't want a peek
      window.clearTimeout(swipe.peekTimeout)
      updateIsSwipe(clientX, clientY, isRightDrawer)
      if (!swipe.isSwipe) {
        if (swipe.isSwipe === false) {
          onMouseUp(e)
        }
        return
      }
    }

    const movementX = isRightDrawer ? swipe.lastX - clientX : clientX - swipe.lastX
    const minWidth = swipe.isOpen ? 0 : PEEK_WIDTH
    const nextX = Math.min(SIDEBAR_WIDTH, Math.max(minWidth, x + movementX))
    updateSpeed(clientX)
    setX(nextX)
  })

  const onMouseDown = useEventCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (swipe.downCaptured) return
    if (x !== 0 && x !== SIDEBAR_WIDTH) return
    const isTouchStart = e.type === 'touchstart'
    let event: {clientX: number; clientY: number}
    if (isTouchStart) {
      document.addEventListener('touchend', onMouseUp, {once: true})
      document.addEventListener('touchmove', onMouseMove)
      event = (e as React.TouchEvent).touches[0]
    } else {
      document.addEventListener('mouseup', onMouseUp, {once: true})
      document.addEventListener('mousemove', onMouseMove)
      event = e as React.MouseEvent
    }
    const {clientX, clientY} = event
    swipe.startX = clientX
    swipe.startY = clientY
    swipe.lastMove = performance.now()
    swipe.lastX = clientX
    swipe.isSwipe = null
    swipe.speed = 0
    if (x === 0) {
      // if it's closed & then press down without moving, it's probably to sneak a peek
      swipe.peekTimeout = window.setTimeout(() => {
        setX(PEEK_WIDTH)
      }, 100)
    }
  })

  return portal(
    <SidebarAndScrim isRightDrawer={isRightDrawer} SIDEBAR_WIDTH={SIDEBAR_WIDTH}>
      <Scrim x={x} SIDEBAR_WIDTH={SIDEBAR_WIDTH} onClick={onToggle} />
      <SidebarAndHandle
        x={x}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        isRightDrawer={isRightDrawer}
      >
        <Sidebar x={x} HYSTERESIS_THRESH={HYSTERESIS_THRESH}>
          {children}
        </Sidebar>
        <SwipeHandle />
      </SidebarAndHandle>
    </SidebarAndScrim>
  )
}

export default SwipeableDashSidebar
