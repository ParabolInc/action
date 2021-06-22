
const computeNewScaleValue = (
  values: number[]
) => {
  return Math.max(0, ...values) + 1
}

export default computeNewScaleValue
