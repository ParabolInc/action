export interface TemplateScaleValueInput {
  color: string
  label: string
}

export default class TemplateScaleValue {
  color: string
  label: string
  constructor(input: TemplateScaleValueInput) {
    const {color, label} = input
    this.color = color
    this.label = label
  }
}
