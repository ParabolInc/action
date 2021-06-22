import generateUID from '../../generateUID'

interface Input {
  id?: string
  queryString: string
  isJQL: boolean
  projectKeyFilters?: string[]
  lastUsedAt?: Date
}

export default class JiraSearchQuery {
  id: string
  queryString: string
  isJQL: boolean
  projectKeyFilters?: string[]
  lastUsedAt: Date
  constructor(input: Input) {
    const {id, queryString, isJQL, projectKeyFilters, lastUsedAt} = input
    this.id = id || generateUID()
    this.queryString = queryString
    this.isJQL = isJQL
    this.projectKeyFilters = projectKeyFilters
    this.lastUsedAt = lastUsedAt || new Date()
  }
}
