/** Types generated for queries found in "packages/server/postgres/queries/src/insertGitHubAuthWIthAllColumnsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'InsertGitHubAuthWithAllColumnsQuery' parameters type */
export interface IInsertGitHubAuthWithAllColumnsQueryParams {
  auths: Array<{
    accessToken: string | null | void
    createdAt: Date | null | void
    updatedAt: Date | null | void
    isActive: boolean | null | void
    login: string | null | void
    teamId: string | null | void
    userId: string | null | void
    githubSearchQueries: JsonArray | null | void
    scope: string | null | void
  }>
}

/** 'InsertGitHubAuthWithAllColumnsQuery' return type */
export type IInsertGitHubAuthWithAllColumnsQueryResult = void

/** 'InsertGitHubAuthWithAllColumnsQuery' query type */
export interface IInsertGitHubAuthWithAllColumnsQueryQuery {
  params: IInsertGitHubAuthWithAllColumnsQueryParams
  result: IInsertGitHubAuthWithAllColumnsQueryResult
}

const insertGitHubAuthWithAllColumnsQueryIR: any = {
  name: 'insertGitHubAuthWithAllColumnsQuery',
  params: [
    {
      name: 'auths',
      codeRefs: {
        defined: {a: 56, b: 60, line: 3, col: 9},
        used: [{a: 378, b: 382, line: 26, col: 8}]
      },
      transform: {
        type: 'pick_array_spread',
        keys: [
          'accessToken',
          'createdAt',
          'updatedAt',
          'isActive',
          'login',
          'teamId',
          'userId',
          'githubSearchQueries',
          'scope'
        ]
      }
    }
  ],
  usedParamSet: {auths: true},
  statement: {
    body:
      'INSERT INTO "GitHubAuth" (\n  "accessToken",\n  "createdAt",\n  "updatedAt",\n  "isActive",\n  "login",\n  "teamId",\n  "userId",\n  "githubSearchQueries",\n  "scope"\n)\nVALUES :auths',
    loc: {a: 210, b: 382, line: 15, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "GitHubAuth" (
 *   "accessToken",
 *   "createdAt",
 *   "updatedAt",
 *   "isActive",
 *   "login",
 *   "teamId",
 *   "userId",
 *   "githubSearchQueries",
 *   "scope"
 * )
 * VALUES :auths
 * ```
 */
export const insertGitHubAuthWithAllColumnsQuery = new PreparedQuery<
  IInsertGitHubAuthWithAllColumnsQueryParams,
  IInsertGitHubAuthWithAllColumnsQueryResult
>(insertGitHubAuthWithAllColumnsQueryIR)
