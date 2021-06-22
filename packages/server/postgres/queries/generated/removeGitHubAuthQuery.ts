/** Types generated for queries found in "packages/server/postgres/queries/src/removeGitHubAuthQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'RemoveGitHubAuthQuery' parameters type */
export interface IRemoveGitHubAuthQueryParams {
  userId: string | null | void
  teamId: string | null | void
}

/** 'RemoveGitHubAuthQuery' return type */
export type IRemoveGitHubAuthQueryResult = void

/** 'RemoveGitHubAuthQuery' query type */
export interface IRemoveGitHubAuthQueryQuery {
  params: IRemoveGitHubAuthQueryParams
  result: IRemoveGitHubAuthQueryResult
}

const removeGitHubAuthQueryIR: any = {
  name: 'removeGitHubAuthQuery',
  params: [
    {
      name: 'userId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 130, b: 135, line: 6, col: 18}]}
    },
    {
      name: 'teamId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 153, b: 158, line: 6, col: 41}]}
    }
  ],
  usedParamSet: {userId: true, teamId: true},
  statement: {
    body:
      'UPDATE "GitHubAuth"\nSET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP\nWHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE',
    loc: {a: 36, b: 180, line: 4, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "GitHubAuth"
 * SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
 * WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE
 * ```
 */
export const removeGitHubAuthQuery = new PreparedQuery<
  IRemoveGitHubAuthQueryParams,
  IRemoveGitHubAuthQueryResult
>(removeGitHubAuthQueryIR)
