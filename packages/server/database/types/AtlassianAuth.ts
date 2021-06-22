import generateUID from '../../generateUID'
import JiraSearchQuery from './JiraSearchQuery'

export interface AtlassianAuthInput {
  id?: string
  createdAt?: Date
  isActive?: boolean
  accessToken: string | null
  accountId: string
  cloudIds: string[]
  refreshToken: string
  teamId: string
  updatedAt?: Date
  userId: string
  jiraSearchQueries?: JiraSearchQuery[]
}

export default class AtlassianAuth {
  id: string
  createdAt: Date
  isActive: boolean
  accessToken: string | null
  accountId: string
  cloudIds: string[]
  jiraSearchQueries?: JiraSearchQuery[]
  refreshToken: string | null
  teamId: string
  updatedAt: Date
  userId: string

  constructor(input: AtlassianAuthInput) {
    const {
      id,
      createdAt,
      isActive,
      accessToken,
      accountId,
      cloudIds,
      jiraSearchQueries,
      refreshToken,
      teamId,
      updatedAt,
      userId
    } = input

    this.id = id || generateUID()
    this.createdAt = createdAt || new Date()
    this.isActive = isActive ?? true
    this.accessToken = accessToken
    this.accountId = accountId
    this.cloudIds = cloudIds
    this.jiraSearchQueries = jiraSearchQueries
    this.refreshToken = refreshToken
    this.teamId = teamId
    this.updatedAt = updatedAt || new Date()
    this.userId = userId
  }
}
