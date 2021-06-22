import palettePickerOptions from '../../../../client/styles/palettePickerOptions'
import TemplateScaleValue from '../../../database/types/TemplateScaleValue'

const validateColorValue = (color: string) => {
  const validHexes = palettePickerOptions.map(({hex}) => hex)
  return validHexes.includes(color)
}

const validateScaleLabel = (label: string) => {
  return 0 < label.length && label.length <= 2
}

const validateScaleLabelValueUniqueness = (scaleValues: TemplateScaleValue[]) => {
  const labelList = scaleValues.map((scaleValue) => scaleValue.label)

  return new Set(labelList).size === labelList.length
}

export {validateColorValue, validateScaleLabel, validateScaleLabelValueUniqueness}
