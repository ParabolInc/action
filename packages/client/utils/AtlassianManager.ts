import AbortController from 'abort-controller'
import JiraServiceTaskId from '../shared/gqlIds/JiraServiceTaskId'
export interface JiraUser {
  self: string
  key: string
  accountId: string
  name: string
  emailAddress: string
  avatarUrls: {[key: string]: string}
  displayName: string
  active: boolean
  timeZone: string
}

export interface AccessibleResource {
  id: string
  name: string
  scopes: string[]
  avatarUrl: string
  url: string
}

interface AvatarURLs {
  '48x48': string
  '24x24': string
  '16x16': string
  '32x32': string
}
export interface JiraProject {
  self: string
  id: string
  key: string
  name: string
  avatarUrls: AvatarURLs
  projectCategory: {
    self: string
    id: string
    name: string
    description: string
  }
  simplified: boolean
  style: string
}

export interface JiraProjectResponse {
  self: string
  nextPage: string
  maxResults: number
  startAt: number
  total: number
  isLast: boolean
  values: JiraProject[]
}

export interface JiraIssueType {
  self: string
  id: string
  description: string
  iconUrl: string
  name: string
  subtask: boolean
  fields?: {
    issuetype: {
      required: boolean
      name: string
      key: string
      hasDefaultValue: false
      operations: string[]
    }
  }
}

export interface AtlassianError {
  code: number
  message: string
}

interface GetProjectsResult {
  cloudId: string
  newProjects: JiraProject[]
}

interface Reporter {
  id: string
}

interface Assignee {
  id: string
}

interface CreateIssueFields {
  assignee: Assignee
  summary: string
  description?: object
  reporter?: Reporter // probably can't use, it throws a lot of errors
  project?: Partial<JiraProject>
  issuetype?: Partial<JiraIssueType>
}

interface IssueCreateMetadata {
  projects: (Pick<JiraProject, 'self' | 'id' | 'key' | 'name' | 'avatarUrls'> & {
    issuetypes: JiraIssueType[]
  })[]
}

interface JiraCreateIssueResponse {
  id: string
  key: string
  self: string
}

type GetProjectsCallback = (error: AtlassianError | null, result: GetProjectsResult | null) => void

interface JiraNoAccessError {
  errorMessages: ['The app is not installed on this instance.']
}
interface JiraFieldError {
  errors: {
    [fieldName: string]: string
  }
}

type JiraError = JiraNoAccessError | JiraFieldError

type JiraIssueProperties = any
type JiraIssueNames = any
type JiraIssueSchema = any
type JiraIssueTransition = any
type JiraOperations = any
type JiraIssueUpdateMetadata = any
type JiraPageOfChangelogs = any
type JiraVersionedRepresentations = any
type JiraIncludedFields = any

interface JiraIssueBean<F = {description: any; summary: string}, R = unknown> {
  expand: string
  id: string
  self: string
  key: string
  renderedFields: R
  properties: JiraIssueProperties
  names: JiraIssueNames
  schema: JiraIssueSchema
  transitions: JiraIssueTransition[]
  operations: JiraOperations
  editmeta: JiraIssueUpdateMetadata
  changelog: JiraPageOfChangelogs
  versionedRepresentations: JiraVersionedRepresentations
  fieldsToInclude: JiraIncludedFields
  fields: F
}

interface JiraAuthor {
  self: string
  emailAddress: string
  avatarUrls: AvatarURLs
  displayName: string
  active: boolean
  timeZone: string
  accountType: 'atlassian'
}

interface JiraAddCommentResponse {
  self: string
  id: string
  author: JiraAuthor
  body: {
    version: 1
    type: 'doc'
    content: any[]
  }
  updateAuthor: JiraAuthor
  created: string
  updated: string
  jsdPublic: true
}

export type JiraGetIssueRes = JiraIssueBean<JiraGQLFields>

interface JiraGQLFields {
  id: string
  cloudId: string
  cloudName: string
  description: any
  descriptionHTML: string
  key: string
  summary: string
}
interface JiraSearchResponse<T = {summary: string; description: string}> {
  expand: string
  startAt: number
  maxResults: number
  total: number
  issues: {
    expand: string
    id: string
    self: string
    key: string
    fields: T
    renderedFields: {
      description: string
    }
  }[]
}

interface JiraField {
  clauseNames: string[]
  custom: boolean
  id: string
  key: string
  name: string
  navigable: boolean
  orderable: boolean
  schema: {
    custom: string
    customId: number
    type: string
  }
  searchable: boolean
  untranslatedName: string
}
const MAX_REQUEST_TIME = 5000
export default abstract class AtlassianManager {
  abstract fetch: typeof fetch
  static SCOPE = 'read:jira-user read:jira-work write:jira-work offline_access'
  accessToken: string
  private readonly fetchWithTimeout: (
    url: string,
    options: RequestInit,
    errorResponse?: any
  ) => ReturnType<typeof fetch>
  private readonly get: (url: string) => any
  private readonly post: (url: string, payload: any) => any
  private readonly put: (url: string, payload: any) => any
  // the any is for node until we can use tsc in nodeland
  cache: {[key: string]: {result: any; expiration: number | any}} = {}
  timeout = 5000

  constructor(accessToken: string) {
    this.accessToken = accessToken
    const headers = {
      // an Authorization requires a preflight request, ie reqs are slow
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json' as const,
      'Content-Type': 'application/json'
    }
    this.fetchWithTimeout = async (url, options, errorResponse?: any) => {
      const controller = new AbortController()
      const {signal} = controller as any
      const timeout = setTimeout(() => {
        controller.abort()
      }, MAX_REQUEST_TIME)
      try {
        const res = await this.fetch(url, {...options, signal})
        clearTimeout(timeout)
        return res
      } catch (e) {
        clearTimeout(timeout)
        if (errorResponse !== undefined) return errorResponse
        return {code: -1, message: 'Atlassian is down'}
      }
    }

    this.post = async (url, payload) => {
      const res = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })
      return (res as any).code === -1 ? res : res.json()
    }

    this.put = async (url, payload) => {
      const res = await this.fetchWithTimeout(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      })
      if (res.status == 204) return null
      if ((res as any).code === -1) return res
      return res.json()
    }

    this.get = async (url) => {
      const res = await this.fetchWithTimeout(url, {headers})
      return (res as any).code === -1 ? res : res.json()
    }
  }

  async getAccessibleResources() {
    return this.get('https://api.atlassian.com/oauth/token/accessible-resources') as
      | AccessibleResource[]
      | AtlassianError
  }

  async getMyself(cloudId: string) {
    return this.get(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`) as
      | JiraUser
      | AtlassianError
  }

  async getPaginatedProjects(cloudId: string, url: string, callback: GetProjectsCallback) {
    const res = (await this.get(url)) as JiraProjectResponse | AtlassianError
    if ('message' in res) {
      callback(res, null)
    } else {
      callback(null, {cloudId, newProjects: res.values})
      if (res.nextPage) {
        await this.getPaginatedProjects(cloudId, res.nextPage, callback).catch(console.error)
      }
    }
  }

  async getProjects(cloudIds: string[], callback: GetProjectsCallback) {
    return Promise.all(
      cloudIds.map(async (cloudId) => {
        return this.getPaginatedProjects(
          cloudId,
          `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search?orderBy=name`,
          callback
        ).catch(console.error)
      })
    )
  }

  async getProjectAvatar(avatarUrl: string) {
    const imageRes = await this.fetchWithTimeout(
      avatarUrl,
      {
        headers: {Authorization: `Bearer ${this.accessToken}`}
      },
      null
    )
    if (!imageRes) return ''
    const arrayBuffer = await imageRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer).toString('base64')
    const contentType = imageRes.headers.get('content-type')
    return `data:${contentType};base64,${buffer}`
  }
  async getAllProjects(cloudIds: string[]) {
    const projects = [] as (JiraProject & {cloudId: string; avatar: string})[]
    let error = null as null | string
    const getProjectPage = async (cloudId: string, url: string) => {
      const res = (await this.get(url)) as JiraProjectResponse | AtlassianError
      if ('message' in res) {
        error = res.message
      } else {
        const jiraProjects = res.values
        const avatars = await Promise.all(
          jiraProjects.map((project) => {
            const url = project.avatarUrls['48x48']
            return this.getProjectAvatar(url)
          })
        )
        jiraProjects.forEach((project, idx) => {
          projects.push({...project, cloudId, avatar: avatars[idx]})
        })
        if (res.nextPage) {
          return getProjectPage(cloudId, res.nextPage)
        }
      }
    }
    await Promise.all(
      cloudIds.map((cloudId) =>
        getProjectPage(
          cloudId,
          `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search?orderBy=name`
        )
      )
    )
    if (error) {
      console.log('getAllProjects ERROR:', error)
    }
    return projects
  }

  async getProject(cloudId: string, projectId: string) {
    const project = (await this.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectId}`
    )) as JiraProject | AtlassianError
    return 'id' in project ? {...project, cloudId} : project
  }

  async convertMarkdownToADF(markdown: string) {
    return this.post('https://api.atlassian.com/pf-editor-service/convert?from=markdown&to=adf', {
      input: markdown
    }) as any
  }

  async getCreateMeta(cloudId: string, projectKeys?: string[]) {
    let args = ''
    if (projectKeys) {
      args += `projectKeys=${projectKeys.join(',')}`
    }
    if (args.length) {
      args = '?' + args
    }
    return this.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/createmeta${args}`
    ) as IssueCreateMetadata | AtlassianError | JiraError
  }

  async getEditMeta(cloudId: string, issueKey: string) {
    return this.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}/editmeta`
    ) as IssueCreateMetadata | AtlassianError | JiraError
  }

  async createIssue(cloudId: string, projectKey: string, issueFields: CreateIssueFields) {
    const payload = {
      fields: {
        project: {
          key: projectKey
        },
        ...issueFields
      } as CreateIssueFields
    }
    return this.post(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue`, payload) as
      | JiraCreateIssueResponse
      | AtlassianError
      | JiraError
  }

  async getCloudNameLookup() {
    const sites = await this.getAccessibleResources()
    const cloudNameLookup = {} as {[cloudId: string]: string}
    if ('message' in sites) {
      return cloudNameLookup
    }
    sites.forEach((site) => {
      cloudNameLookup[site.id] = site.name
    })
    return cloudNameLookup
  }

  async getIssue(cloudId: string, issueKey: string, extraFieldIds: string[] = []) {
    const baseFields = ['summary', 'description']
    const fields = [...baseFields, ...extraFieldIds].join(',')
    const [cloudNameLookup, issueRes] = await Promise.all([
      this.getCloudNameLookup(),
      this.get(
        `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}?fields=${fields}&expand=renderedFields`
      ) as AtlassianError | JiraError | JiraIssueBean
    ])
    if ('fields' in issueRes) {
      const fields = issueRes.fields as any
      fields.cloudName = cloudNameLookup[cloudId]
      fields.descriptionHTML = (issueRes as any).renderedFields.description
      fields.cloudId = cloudId
      fields.key = issueKey
      fields.id = `${cloudId}:${issueKey}`
    }
    return issueRes as AtlassianError | JiraError | JiraGetIssueRes
  }

  async getIssues(
    queryString: string,
    isJQL: boolean,
    projectFiltersByCloudId: {[cloudId: string]: string[]}
  ) {
    const cloudIds = Object.keys(projectFiltersByCloudId)
    const allIssues = [] as JiraGQLFields[]
    let firstError: string | null = null
    const composeJQL = (queryString: string | null, isJQL: boolean, projectKeys: string[]) => {
      const orderBy = 'order by lastViewed DESC'
      if (isJQL) return queryString || orderBy
      const projectFilter = projectKeys.length
        ? `project in (${projectKeys.map((val) => `\"${val}\"`).join(', ')})`
        : ''
      const textFilter = queryString ? `text ~ \"${queryString}\"` : ''
      const and = projectFilter && textFilter ? ' AND ' : ''
      return `${projectFilter}${and}${textFilter} ${orderBy}`
    }
    const reqs = cloudIds.map(async (cloudId) => {
      const projectKeys = projectFiltersByCloudId[cloudId]
      const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`
      const jql = composeJQL(queryString, isJQL, projectKeys)
      const payload = {
        jql,
        maxResults: 100,
        fields: ['summary', 'description'],
        expand: ['renderedFields']
      }
      // TODO add type
      const res = (await this.post(url, payload)) as AtlassianError | JiraError | JiraSearchResponse
      if (!firstError) {
        if ('message' in res) {
          firstError = res.message
        } else if ('errorMessages' in res) {
          firstError = res.errorMessages[0]
          if (firstError.includes('THe app is not installed on this instance')) {
            firstError = 'Jira access revoked. Please reintegrate with Jira.'
          }
        }
      }

      if ('issues' in res) {
        const {issues} = res
        issues.forEach((issue) => {
          const {key, fields, renderedFields} = issue
          const {description, summary} = fields
          const {description: descriptionHTML} = renderedFields
          const gqlFields = {
            key,
            summary,
            cloudId,
            id: JiraServiceTaskId.join(cloudId, key),
            description,
            descriptionHTML,
            cloudName: ''
          } as JiraGQLFields
          allIssues.push(gqlFields)
        })
      }
    })
    const [cloudNameLookup] = await Promise.all([this.getCloudNameLookup() as any, ...reqs])
    allIssues.forEach((issue) => {
      issue.cloudName = cloudNameLookup[issue.cloudId]
    })
    return {error: firstError as string | null, issues: allIssues}
  }

  async getComments(cloudId: string, issueKey: string) {
    return this.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}/comment`
    ) as any
  }

  async getFields(cloudId: string) {
    return this.get(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/field`) as JiraField[]
  }

  async getFieldScreens(cloudId: string, fieldId: string) {
    return this.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/field/${fieldId}/screens`
    ) as any
  }

  async addComment(cloudId: string, issueKey: string, body: object) {
    const payload = {
      body
    }
    return this.post(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}/comment`,
      payload
    ) as AtlassianError | JiraAddCommentResponse
  }

  async getFirstValidJiraField(
    cloudId: string,
    possibleFieldNames: string[],
    testIssueKeyId: string
  ) {
    const fields = await this.getFields(cloudId)

    const possibleFields = possibleFieldNames
      .map((fieldName) => {
        return fields.find((field) => field.name === fieldName)
      })
      .filter(Boolean) as JiraField[]
    const updateResArr = await Promise.all(
      possibleFields.map((field) => {
        return this.put(
          `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${testIssueKeyId}`,
          {
            fields: {
              [field.id]: 0
            }
          }
        ) as null | AtlassianError | JiraError
      })
    )
    const firstValidUpdateIdx = updateResArr.indexOf(null)
    if (firstValidUpdateIdx === -1) return null
    return possibleFields[firstValidUpdateIdx]
  }
  async updateStoryPoints(
    cloudId: string,
    issueKey: string,
    storyPoints: string | number,
    fieldId: string,
    fieldName: string
  ) {
    const payload = {
      fields: {
        [fieldId]: isFinite(storyPoints as number) ? Number(storyPoints) : storyPoints
      }
    }
    const res = (await this.put(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}`,
      payload
    )) as null | AtlassianError | JiraError
    if (res !== null) {
      console.log('ERR', {res, storyPoints, fieldId, issueKey, cloudId})
      if ('message' in res) {
        throw new Error(res.message)
      }

      if ('errorMessages' in res) {
        const globalError = res.errorMessages?.[0]
        if (globalError) {
          if (globalError.includes('The app is not installed on this instance')) {
            throw new Error(
              'The user who added this issue was removed from Jira. Please remove & re-add the issue'
            )
          }
          throw new Error(globalError)
        }
      }
      if ('errors' in res) {
        const fieldError = res.errors[fieldId]
        if (fieldError.includes('is not on the appropriate screen')) {
          throw new Error(
            `Update failed! In Jira, add the field "${fieldName}" to the Issue screen.`
          )
        }
        throw new Error(`Jira: ${fieldError}`)
      }
      throw new Error('Cannot update field in Jira')
    }
  }
}
