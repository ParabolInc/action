/** Types generated for queries found in "packages/server/postgres/queries/src/getGitHubAuthByTeamIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'GetGitHubAuthByTeamIdQuery' parameters type */
export interface IGetGitHubAuthByTeamIdQueryParams {
  teamIds: Array<string | null | void>
}

/** 'GetGitHubAuthByTeamIdQuery' return type */
export interface IGetGitHubAuthByTeamIdQueryResult {
  accessToken: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  login: string
  teamId: string
  userId: string
  githubSearchQueries: JsonArray
  scope: string
}

/** 'GetGitHubAuthByTeamIdQuery' query type */
export interface IGetGitHubAuthByTeamIdQueryQuery {
  params: IGetGitHubAuthByTeamIdQueryParams
  result: IGetGitHubAuthByTeamIdQueryResult
}

const getGitHubAuthByTeamIdQueryIR: any = {
  name: 'getGitHubAuthByTeamIdQuery',
  params: [
    {
      name: 'teamIds',
      codeRefs: {
        defined: {a: 47, b: 53, line: 3, col: 9},
        used: [{a: 113, b: 119, line: 6, col: 19}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {teamIds: true},
  statement: {
    body: 'SELECT * FROM "GitHubAuth"\nWHERE "teamId" IN :teamIds',
    loc: {a: 67, b: 119, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "GitHubAuth"
 * WHERE "teamId" IN :teamIds
 * ```
 */
export const getGitHubAuthByTeamIdQuery = new PreparedQuery<
  IGetGitHubAuthByTeamIdQueryParams,
  IGetGitHubAuthByTeamIdQueryResult
>(getGitHubAuthByTeamIdQueryIR)
