import {Dispatch, MutableRefObject, SetStateAction, useEffect, useLayoutEffect, useRef} from 'react'
import {BBox} from '../types/animations'
import {PortalStatus} from './usePortal'
import useRefState from './useRefState'
import useResizeObserver from './useResizeObserver'

export type UseCoordsValue =
  | {top: number; left: number}
  | {top: number; right: number}
  | {bottom: number; right: number}
  | {bottom: number; left: number}

interface CoordState {
  coords: UseCoordsValue
  menuPosition: MenuPosition
}

export enum MenuPosition {
  UPPER_LEFT,
  UPPER_RIGHT,
  UPPER_CENTER,
  LOWER_LEFT,
  LOWER_RIGHT,
  LOWER_CENTER
}

const getOffset = (orientation, fullWidth) => {
  if (orientation === 'center') {
    return fullWidth / 2
  } else if (orientation === 'right' || orientation === 'bottom') {
    return fullWidth
  }
  return 0
}

const anchorLookup = {
  [MenuPosition.UPPER_LEFT]: {
    targetAnchor: {
      horizontal: 'left',
      vertical: 'top'
    },
    originAnchor: {
      horizontal: 'left',
      vertical: 'bottom'
    }
  },
  [MenuPosition.UPPER_RIGHT]: {
    targetAnchor: {
      horizontal: 'right',
      vertical: 'top'
    },
    originAnchor: {
      horizontal: 'right',
      vertical: 'bottom'
    }
  },
  [MenuPosition.UPPER_CENTER]: {
    targetAnchor: {
      horizontal: 'center',
      vertical: 'top'
    },
    originAnchor: {
      horizontal: 'center',
      vertical: 'bottom'
    }
  },
  [MenuPosition.LOWER_LEFT]: {
    targetAnchor: {
      horizontal: 'left',
      vertical: 'bottom'
    },
    originAnchor: {
      horizontal: 'left',
      vertical: 'top'
    }
  },
  [MenuPosition.LOWER_RIGHT]: {
    targetAnchor: {
      horizontal: 'right',
      vertical: 'bottom'
    },
    originAnchor: {
      horizontal: 'right',
      vertical: 'top'
    }
  },
  [MenuPosition.LOWER_CENTER]: {
    targetAnchor: {
      horizontal: 'center',
      vertical: 'bottom'
    },
    originAnchor: {
      horizontal: 'center',
      vertical: 'top'
    }
  }
}

const lowerLookup = {
  [MenuPosition.UPPER_LEFT]: MenuPosition.LOWER_LEFT,
  [MenuPosition.UPPER_RIGHT]: MenuPosition.LOWER_RIGHT
}

const MENU_PADDING = 4

const getNextCoords = (targetBBox: BBox, originBBox: BBox, preferredMenuPosition: MenuPosition) => {
  const {height: modalHeight, width: modalWidth} = targetBBox
  const {height: originHeight, width: originWidth, left: originLeft, top: originTop} = originBBox
  const {originAnchor, targetAnchor} = anchorLookup[preferredMenuPosition]
  const nextCoords = {} as any

  const originLeftOffset = getOffset(originAnchor.horizontal, originWidth)
  const {scrollX, scrollY, innerHeight} = window
  // Do not use window.innerWidth because that does not account for the scrollbar width
  const pageWidth = document.documentElement.clientWidth
  if (targetAnchor.horizontal !== 'right') {
    const targetLeftOffset = getOffset(targetAnchor.horizontal, modalWidth)
    const left = scrollX + originLeft + originLeftOffset - targetLeftOffset
    const maxLeft = pageWidth - modalWidth + scrollX
    nextCoords.left = Math.min(left, maxLeft)
  } else {
    const right = pageWidth - (originLeft + originLeftOffset) - scrollX
    const maxRight = pageWidth - modalWidth - scrollX
    nextCoords.right = Math.min(right, maxRight)
  }

  if (targetAnchor.vertical !== 'bottom') {
    const originTopOffset = getOffset(originAnchor.vertical, originHeight)
    const targetTopOffset = getOffset(targetAnchor.vertical, modalHeight)
    const top = scrollY + originTop + originTopOffset - targetTopOffset
    const isBelow = top + modalHeight < innerHeight + scrollY
    if (isBelow) {
      nextCoords.top = top + MENU_PADDING
    }
  }
  const menuPosition =
    (nextCoords.top === undefined && lowerLookup[preferredMenuPosition]) || preferredMenuPosition
  // if by choice or circumstance, put it above & anchor it from the bottom
  if (nextCoords.top === undefined) {
    const bottom = innerHeight - originTop - scrollY
    const maxBottom = innerHeight - modalHeight + scrollY
    nextCoords.bottom = Math.min(bottom, maxBottom) + MENU_PADDING
  }
  return {coords: nextCoords as UseCoordsValue, menuPosition}
}

export interface UseCoordsOptions {
  originCoords?: BBox
  portalStatus?: PortalStatus
}

const useWindowResize = <T extends HTMLElement = HTMLButtonElement>(
  coordsRef: MutableRefObject<CoordState>,
  currentTargetRef: T | null,
  setCoords: Dispatch<SetStateAction<CoordState>>
) => {
  useEffect(() => {
    const resizeWindow = () => {
      const {coords, menuPosition} = coordsRef.current
      if (currentTargetRef && ('right' in coords || 'bottom' in coords)) {
        const targetCoords = currentTargetRef.getBoundingClientRect()
        setCoords({
          coords: {
            left: targetCoords.left,
            top: targetCoords.top
          },
          menuPosition
        })
      }
    }
    window.addEventListener('resize', resizeWindow, {passive: true})
    return () => {
      window.removeEventListener('resize', resizeWindow)
    }
  }, [coordsRef, currentTargetRef, setCoords])
}

const useCoords = <
  T extends HTMLElement = HTMLButtonElement | HTMLDivElement,
  P extends HTMLElement = HTMLDivElement
>(
  preferredMenuPosition: MenuPosition,
  options: UseCoordsOptions = {}
) => {
  const targetRef = useRef<P>(null)
  const originRef = useRef<T | null>(null)
  const [coordsRef, setCoords] = useRefState<CoordState>({
    coords: {left: 0, top: 0},
    menuPosition: preferredMenuPosition
  })
  useLayoutEffect(() => {
    if (!targetRef.current || !originRef.current) return
    // Bounding adjustments mimic native (flip from below to above for Y, but adjust pixel-by-pixel for X)
    const targetBBox = targetRef.current?.getBoundingClientRect()
    const originBBox = originRef.current?.getBoundingClientRect()
    if (targetBBox && originBBox) {
      const coordState = getNextCoords(targetBBox, originBBox, preferredMenuPosition)
      setCoords(coordState)
    }
  }, [
    targetRef.current,
    setCoords,
    options.originCoords,
    preferredMenuPosition,
    options.portalStatus
  ])

  useResizeObserver(() => {
    const targetBBox = targetRef.current?.getBoundingClientRect()
    const originBBox = originRef.current?.getBoundingClientRect()
    if (targetBBox && originBBox) {
      const coordState = getNextCoords(targetBBox, originBBox, preferredMenuPosition)
      setCoords(coordState)
    }
  }, targetRef)

  useWindowResize(coordsRef, targetRef.current, setCoords)
  const {coords, menuPosition} = coordsRef.current

  return {targetRef, originRef, coords, menuPosition}
}

export default useCoords
