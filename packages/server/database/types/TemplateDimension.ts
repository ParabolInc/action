import generateUID from '../../generateUID'

export interface TemplateDimensionInput {
  name: string
  description: string
  teamId: string
  templateId: string
  sortOrder: number
  scaleId: string
  removedAt?: Date
}

export default class TemplateDimension {
  id: string
  name: string
  description: string
  teamId: string
  templateId: string
  sortOrder: number
  scaleId: string
  createdAt = new Date()
  updatedAt = new Date()
  removedAt?: Date

  constructor(input: TemplateDimensionInput) {
    const {name, description, teamId, templateId, sortOrder, scaleId, removedAt} = input
    this.id = generateUID()
    this.name = name
    this.description = description
    this.teamId = teamId
    this.templateId = templateId
    this.sortOrder = sortOrder
    this.scaleId = scaleId
    this.removedAt = removedAt
  }
}
