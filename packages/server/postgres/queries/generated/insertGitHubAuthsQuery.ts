/** Types generated for queries found in "packages/server/postgres/queries/src/insertGitHubAuthsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'InsertGitHubAuthsQuery' parameters type */
export interface IInsertGitHubAuthsQueryParams {
  auths: Array<{
    accessToken: string | null | void
    createdAt: Date | null | void
    updatedAt: Date | null | void
    isActive: boolean | null | void
    login: string | null | void
    teamId: string | null | void
    userId: string | null | void
  }>
}

/** 'InsertGitHubAuthsQuery' return type */
export type IInsertGitHubAuthsQueryResult = void

/** 'InsertGitHubAuthsQuery' query type */
export interface IInsertGitHubAuthsQueryQuery {
  params: IInsertGitHubAuthsQueryParams
  result: IInsertGitHubAuthsQueryResult
}

const insertGitHubAuthsQueryIR: any = {
  name: 'insertGitHubAuthsQuery',
  params: [
    {
      name: 'auths',
      codeRefs: {
        defined: {a: 43, b: 47, line: 3, col: 9},
        used: [{a: 245, b: 249, line: 6, col: 8}]
      },
      transform: {
        type: 'pick_array_spread',
        keys: ['accessToken', 'createdAt', 'updatedAt', 'isActive', 'login', 'teamId', 'userId']
      }
    }
  ],
  usedParamSet: {auths: true},
  statement: {
    body:
      'INSERT INTO "GitHubAuth" ("accessToken", "createdAt", "updatedAt", "isActive", "login", "teamId", "userId")\nVALUES :auths',
    loc: {a: 129, b: 249, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "GitHubAuth" ("accessToken", "createdAt", "updatedAt", "isActive", "login", "teamId", "userId")
 * VALUES :auths
 * ```
 */
export const insertGitHubAuthsQuery = new PreparedQuery<
  IInsertGitHubAuthsQueryParams,
  IInsertGitHubAuthsQueryResult
>(insertGitHubAuthsQueryIR)
