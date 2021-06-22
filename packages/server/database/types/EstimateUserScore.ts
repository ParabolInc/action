interface Input {
  userId: string
  label: string
}

export default class EstimateUserScore {
  userId: string
  // label is included here because the TemplateScaleValue is mutable & we want to preserve history
  label: string
  constructor(input: Input) {
    const {userId, label} = input
    this.userId = userId
    this.label = label
  }
}
