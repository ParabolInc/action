import {Elevation} from '../../styles/elevation'
import {BezierCurve, DragAttribute, Times} from '../../types/constEnums'
import getDeCasteljau from '../getDeCasteljau'

export const getMinTop = (top: number, targetEl: HTMLElement | null) => {
  if (top >= 0) return top
  let dropzone = targetEl
  while (dropzone && dropzone.hasAttribute) {
    if (dropzone.hasAttribute(DragAttribute.DROPZONE)) return dropzone.getBoundingClientRect().top
    dropzone = dropzone.parentElement
  }
  return top
}

const getTransition = (isClipped: boolean, timeRemaining: number) => {
  const completed = 1 - timeRemaining / Times.REFLECTION_DROP_DURATION
  const curve = getDeCasteljau(completed, BezierCurve.DECELERATE)
  const t = `${timeRemaining}ms ${curve}`
  const transition = `box-shadow ${t}, transform ${t}`
  return isClipped
    ? `${transition}, opacity ${timeRemaining / 2}ms ${curve} ${timeRemaining / 2}ms`
    : transition
}

export const getDroppingStyles = (
  targetEl: HTMLDivElement,
  bbox: ClientRect,
  maxTop: number,
  timeRemaining: number
) => {
  const {top, left} = bbox
  const minTop = getMinTop(top, targetEl)
  const clippedTop = Math.min(Math.max(minTop, top), maxTop - bbox.height)
  const isClipped = clippedTop !== top
  return {
    transform: `translate(${left}px,${clippedTop}px)`,
    transition: getTransition(isClipped, timeRemaining),
    opacity: isClipped ? 0 : 1
  }
}

const maybeUpdate = (
  clone: HTMLDivElement,
  targetEl: HTMLDivElement,
  maxTop: number,
  timeRemaining: number,
  lastTargetTop?: number
) => {
  if (timeRemaining <= 0) return
  const targetBBox = targetEl.getBoundingClientRect()
  if (!targetBBox) {
    document.body.removeChild(clone)
    return
  }
  if (lastTargetTop !== targetBBox.top) {
    const {transform, transition, opacity} = getDroppingStyles(
      targetEl,
      targetBBox,
      maxTop,
      timeRemaining
    )
    const {style} = clone
    style.transform = transform
    style.boxShadow = Elevation.CARD_SHADOW
    style.opacity = String(opacity)
    style.transition = transition
  }
  const beforeFrame = Date.now()
  // the target maybe be moving, so update every frame
  // REPRO: create a list of 12 cards. drag the 2nd from bottom to somewhere else & drop to cancel the drag
  requestAnimationFrame(() => {
    const timeElapsed = Date.now() - beforeFrame
    const newTimeRemaining = timeRemaining - timeElapsed
    maybeUpdate(clone, targetEl, maxTop, newTimeRemaining, targetBBox.top)
  })
}

const updateClonePosition = (targetEl: HTMLDivElement, reflectionId: string, maxTop: number) => {
  const clone = document.getElementById(`clone-${reflectionId}`) as HTMLDivElement
  if (!clone) return
  maybeUpdate(clone, targetEl, maxTop, Times.REFLECTION_DROP_DURATION)
}

export default updateClonePosition
