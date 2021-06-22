import {DocumentNode} from 'graphql-typed'
import {ICreateIssueInput} from '../types/githubGraphql'
import createIssue from './githubQueries/createIssue.graphql'
import getProfile from './githubQueries/getProfile.graphql'
import getRepoInfo from './githubQueries/getRepoInfo.graphql'
import getRepos from './githubQueries/getRepos.graphql'

export interface GQLResponse<TData> {
  data?: TData
  errors?: any[]
}

export interface GitHubCredentialError {
  message: string
  documentation_url: string
}

type GitHubResponse<TData> = GQLResponse<TData> | GitHubCredentialError

type DocResponse<T> = T extends DocumentNode<infer R> ? R : never
type DocVariables = any
// type DocVariables<T> = T extends DocumentNode<any, infer V> ? V : never

abstract class GitHubManager {
  static SCOPE = 'admin:org_hook,read:org,repo,user:email,write:repo_hook'
  accessToken: string
  abstract fetch: any
  // the any is for node until we can use tsc in nodeland
  cache: {[key: string]: {result: any; expiration: number | any}} = {}
  timeout = 5000
  headers: any
  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.headers = {
      'Content-Type': 'application/json',
      // an Authorization requires a preflight request, ie reqs are slow
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json' as 'application/json'
    }
  }

  private async post<T>(body: string): Promise<GitHubResponse<T>> {
    const res = await this.fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: this.headers,
      body
    })
    return res.json()
  }

  private async query<T>(
    query: T,
    variables?: DocVariables
  ): Promise<GitHubResponse<DocResponse<T>>> {
    // const query = _query as unknown as string
    const body = JSON.stringify({query, variables})
    const record = this.cache[body]
    if (!record) {
      const result = await this.post(body)
      this.cache[body] = {
        result,
        expiration: setTimeout(() => {
          delete this.cache[body]
        }, this.timeout)
      }
    } else {
      clearTimeout(record.expiration)
      record.expiration = setTimeout(() => {
        delete this.cache[body]
      }, this.timeout)
    }
    return this.cache[body].result
  }

  private async mutate<T>(
    query: T,
    variables?: DocVariables
  ): Promise<GitHubResponse<DocResponse<T>>> {
    const body = JSON.stringify({query, variables})
    return this.post(body)
  }

  async getRepos() {
    return this.query(getRepos)
  }

  async getRepoInfo(nameWithOwner: string, assigneeLogin: string) {
    const [repoOwner, repoName] = nameWithOwner.split('/')
    return this.query(getRepoInfo, {repoName, repoOwner, assigneeLogin} as any)
  }

  async getProfile() {
    return this.query(getProfile)
  }

  async createIssue(createIssueInput: ICreateIssueInput) {
    return this.mutate(createIssue, {input: createIssueInput} as any)
  }
}

export default GitHubManager
