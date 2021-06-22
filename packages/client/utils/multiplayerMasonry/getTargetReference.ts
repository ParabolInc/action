import {ElementWidth} from '../../types/constEnums'
import {TargetBBox} from '../../components/ReflectionGroup/DraggableReflectionCard'

// The following improves accuracy by predicting where the cursor is headed, not where it is

// const getSpeed = (history) => {
//   if (history.length === 1) return 0
//   const delta = history[history.length - 1].x - history[0].x
//   return delta / history.length
// }
//
// const getLinearRegression = (history) => {
//   if (history.length === 1) return {m: 0, b: history[0].y}
//   let sumX = 0
//   let sumY = 0
//   let sumXX = 0
//   let sumXY = 0
//   for (let i = 0; i < history.length; i++) {
//     const point = history[i]
//     const {x, y} = point
//     sumX += x
//     sumY += y
//     sumXX += x * x
//     sumXY += x * y
//   }
//   const m = ((history.length * sumXY) - (sumX * sumY)) / ((history.length * sumXX) - (sumX * sumX))
//   const b = (sumY / history.length) - ((m * sumX) / history.length)
//   return {m, b}
// }
//
// const FORECAST_PERIODS = 40
//
// // assume the reference coordinate is somewhere in the future to avoid cards that we just left
// // Current position:  o--x-----------o
// // Forecast position: o---------x----o
// const getReferenceCoord = (history) => {
//   // return history[history.length -1]
//   const speed = getSpeed(history)
//   const {m, b} = getLinearRegression(history)
//   const x= history[history.length - 1].x + FORECAST_PERIODS * speed
//   const y = m * x+ b
//   return {x, y}
// }

// increasing this increases the probability that the targetId is not the nearest
const SWITCHING_COST = 50

  // if it's clear they aren't near a card, don't try to force a relative position
  const MAX_DIST = ElementWidth.REFLECTION_CARD

const getTargetReference = (
  cursorX: number,
  cursorY: number,
  cardOffsetX: number,
  cardOffsetY: number,
  targets: TargetBBox[],
  prevTargetId: string
) => {
  const distances = [] as number[]
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    distances[i] = 1e6
    const centroidX = target.left + ElementWidth.REFLECTION_CARD / 2
    const centroidY = target.top + target.height / 2
    const deltaX = centroidX - cursorX
    const deltaY = centroidY - cursorY
    // favor the existing reference to reduce jitter
    const loyaltyDiscount = target.targetId === prevTargetId ? SWITCHING_COST : 0

    // distance is from cursor to card centroid
    distances[i] = Math.sqrt(Math.abs(deltaX) ** 2 + Math.abs(deltaY) ** 2) - loyaltyDiscount
  }
  const minValue = Math.min(...distances)

  // if they were off the grid, require them to get very close to a card so we can assume they're back on the grid
  const relativePlacementThresh = prevTargetId ? MAX_DIST : MAX_DIST / 2
  if (minValue > relativePlacementThresh) return {targetId: '', targetOffset: null}
  const minIdx = distances.indexOf(minValue)
  const nextTarget = targets[minIdx]

  return {
    targetId: nextTarget.targetId,
    targetOffsetX: cursorX - nextTarget.left - cardOffsetX,
    targetOffsetY: cursorY - nextTarget.top - cardOffsetY
  }
}

export default getTargetReference
