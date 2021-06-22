/** Types generated for queries found in "packages/server/postgres/queries/src/removeUserTmsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type stringArray = string[]

/** 'RemoveUserTmsQuery' parameters type */
export interface IRemoveUserTmsQueryParams {
  ids: Array<string | null | void>
  teamIds: stringArray | null | void
}

/** 'RemoveUserTmsQuery' return type */
export type IRemoveUserTmsQueryResult = void

/** 'RemoveUserTmsQuery' query type */
export interface IRemoveUserTmsQueryQuery {
  params: IRemoveUserTmsQueryParams
  result: IRemoveUserTmsQueryResult
}

const removeUserTmsQueryIR: any = {
  name: 'removeUserTmsQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 39, b: 41, line: 3, col: 9},
        used: [{a: 118, b: 120, line: 7, col: 13}]
      },
      transform: {type: 'array_spread'}
    },
    {
      name: 'teamIds',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 96, b: 102, line: 6, col: 23}]}
    }
  ],
  usedParamSet: {teamIds: true, ids: true},
  statement: {
    body: 'UPDATE "User" SET\n  tms = arr_diff(tms, :teamIds)\nWHERE id IN :ids',
    loc: {a: 55, b: 120, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" SET
 *   tms = arr_diff(tms, :teamIds)
 * WHERE id IN :ids
 * ```
 */
export const removeUserTmsQuery = new PreparedQuery<
  IRemoveUserTmsQueryParams,
  IRemoveUserTmsQueryResult
>(removeUserTmsQueryIR)
