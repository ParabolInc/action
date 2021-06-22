type FieldType = 'string' | 'number'
interface Input {
  cloudId: string
  fieldId: string
  dimensionName: string
  fieldName: string
  fieldType: FieldType
  projectKey: string
}

export default class JiraDimensionField {
  cloudId: string
  dimensionName: string
  fieldId: string
  fieldName: string
  fieldType: FieldType
  projectKey: string
  constructor(input: Input) {
    const {cloudId, fieldId, dimensionName, fieldName, fieldType, projectKey} = input
    this.cloudId = cloudId
    this.fieldId = fieldId
    this.dimensionName = dimensionName
    this.fieldName = fieldName
    this.fieldType = fieldType
    this.projectKey = projectKey
  }
}
