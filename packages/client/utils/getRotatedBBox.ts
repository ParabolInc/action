// make the pattern large enough to fill the background
// imagine fitting a rectangle into a larger rect that is rotated 15 degrees, how big is that bigger one?
const getRotatedBBox = (rotationDegrees: number, width: number, height: number) => {
  const radians = (rotationDegrees * Math.PI) / 180
  const sinROT = Math.sin(radians)
  const cosROT = Math.cos(radians)
  const w1 = sinROT * height
  const w2 = cosROT * width
  const h1 = cosROT * height
  const h2 = sinROT * width
  return {
    width: Math.ceil(w1 + w2),
    height: Math.ceil(h1 + h2),
    xOffset: Math.round(sinROT * h1),
    yOffset: Math.round(sinROT * w1)
  }
}

export default getRotatedBBox
