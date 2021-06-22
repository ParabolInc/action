/** Types generated for queries found in "packages/server/postgres/queries/src/getGitHubAuthByUserIdTeamIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'GetGitHubAuthByUserIdTeamIdQuery' parameters type */
export interface IGetGitHubAuthByUserIdTeamIdQueryParams {
  userId: string | null | void
  teamId: string | null | void
}

/** 'GetGitHubAuthByUserIdTeamIdQuery' return type */
export interface IGetGitHubAuthByUserIdTeamIdQueryResult {
  accessToken: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  login: string
  teamId: string
  userId: string
}

/** 'GetGitHubAuthByUserIdTeamIdQuery' query type */
export interface IGetGitHubAuthByUserIdTeamIdQueryQuery {
  params: IGetGitHubAuthByUserIdTeamIdQueryParams
  result: IGetGitHubAuthByUserIdTeamIdQueryResult
}

const getGitHubAuthByUserIdTeamIdQueryIR: any = {
  name: 'getGitHubAuthByUserIdTeamIdQuery',
  params: [
    {
      name: 'userId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 92, b: 97, line: 5, col: 18}]}
    },
    {
      name: 'teamId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 115, b: 120, line: 5, col: 41}]}
    }
  ],
  usedParamSet: {userId: true, teamId: true},
  statement: {
    body:
      'SELECT * from "GitHubAuth"\nWHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE',
    loc: {a: 47, b: 142, line: 4, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "GitHubAuth"
 * WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE
 * ```
 */
export const getGitHubAuthByUserIdTeamIdQuery = new PreparedQuery<
  IGetGitHubAuthByUserIdTeamIdQueryParams,
  IGetGitHubAuthByUserIdTeamIdQueryResult
>(getGitHubAuthByUserIdTeamIdQueryIR)
