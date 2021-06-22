import generateUID from '../../generateUID'

interface Input {
  teamId: string
  templateId: string
  sortOrder: number
  question: string
  description: string
  groupColor: string
  removedAt: Date | null
  title?: string
  parentPromptId?: string
}

export default class RetrospectivePrompt {
  id: string
  createdAt = new Date()
  description: string
  groupColor: string
  sortOrder: number
  teamId: string
  templateId: string
  question: string
  removedAt: Date | null
  title: string
  updatedAt = new Date()
  parentPromptId?: string

  constructor(input: Input) {
    const {
      teamId,
      templateId,
      sortOrder,
      question,
      description,
      groupColor,
      removedAt,
      title,
      parentPromptId
    } = input
    this.id = generateUID()
    this.sortOrder = sortOrder
    this.teamId = teamId
    this.templateId = templateId
    this.question = question
    this.description = description || ''
    this.groupColor = groupColor
    this.removedAt = removedAt
    this.title = title || question
    this.parentPromptId = parentPromptId
  }
}
