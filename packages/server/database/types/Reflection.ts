import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import generateUID from '../../generateUID'
import GoogleAnalyzedEntity from './GoogleAnalyzedEntity'
import Reactji from './Reactji'

export interface ReflectionInput {
  id?: string
  createdAt?: Date
  creatorId: string
  content: string
  plaintextContent?: string // the plaintext version of content
  entities: GoogleAnalyzedEntity[]
  meetingId: string
  reactjis?: Reactji[]
  reflectionGroupId?: string
  promptId: string
  sortOrder?: number
  updatedAt?: Date
}

export default class Reflection {
  id: string
  autoReflectionGroupId?: string
  createdAt: Date
  creatorId: string
  content: string
  plaintextContent: string
  entities: GoogleAnalyzedEntity[]
  isActive: boolean
  meetingId: string
  reactjis: Reactji[]
  reflectionGroupId: string
  promptId: string
  sortOrder: number
  updatedAt: Date
  constructor(input: ReflectionInput) {
    const {
      content,
      plaintextContent,
      createdAt,
      creatorId,
      entities,
      id,
      meetingId,
      reactjis,
      reflectionGroupId,
      promptId,
      sortOrder,
      updatedAt
    } = input
    const now = new Date()
    this.id = id || generateUID()
    this.createdAt = createdAt || now
    this.creatorId = creatorId
    this.content = content
    this.plaintextContent = plaintextContent || extractTextFromDraftString(content)
    this.entities = entities
    this.isActive = true
    this.meetingId = meetingId
    this.reactjis = reactjis || []
    this.reflectionGroupId = reflectionGroupId || generateUID()
    this.promptId = promptId
    this.sortOrder = sortOrder || 0
    this.updatedAt = updatedAt || now
  }
}
