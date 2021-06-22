// Imagine you have an animation that takes 10 seconds
// After 5 seconds, how much of the animation would be complete?
// If the curve is linear, the answer is 50%
// If the curve decelerates (ie very fast at first, then gradually slower), it'll be > 50%
// Now, the inverse: given that the animation is 70% complete, how much time has elapsed?
// Calculating this is hard, so instead I built a LUT and then iterate over it to find the approximation

const bezierLookup = [] as {x: number, y: number}[]

const getBezierTimePercentGivenDistancePercent = (threshold: number, bezierCurve: string) => {
  if (bezierLookup.length === 0) {
    const re = /\(([^)]+)\)/
    const [x1, y1, x2, y2] = re
      .exec(bezierCurve)![1]
      .split(',')
      .map(Number)
    // css bezier-curves imply a start of 0,0 and end of 1,1
    const x0 = 0
    const y0 = 0
    const x3 = 1
    const y3 = 1

    const cX = 3 * (x1 - x0)
    const bX = 3 * (x2 - x1) - cX
    const aX = x3 - x0 - cX - bX
    const cY = 3 * (y1 - y0)
    const bY = 3 * (y2 - y1) - cY
    const aY = y3 - y0 - cY - bY

    for (let t = 0; t < 1; t += .01) {
      const x = aX * t ** 3 + bX * t ** 2 + (cX * t) + x0
      const y = aY * t ** 3 + bY * t ** 2 + (cY * t) + y0
      bezierLookup.push({x, y})
    }
  }
  let x
  for (let i = 1; i < bezierLookup.length; i++) {
    const point = bezierLookup[i]
    if (point.y > threshold) {
      x = bezierLookup[i - 1].x
      break
    }
  }
  return x
}

export default getBezierTimePercentGivenDistancePercent
