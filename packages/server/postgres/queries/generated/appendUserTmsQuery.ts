/** Types generated for queries found in "packages/server/postgres/queries/src/appendUserTmsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'AppendUserTmsQuery' parameters type */
export interface IAppendUserTmsQueryParams {
  teamId: string | null | void
  id: string | null | void
}

/** 'AppendUserTmsQuery' return type */
export type IAppendUserTmsQueryResult = void

/** 'AppendUserTmsQuery' query type */
export interface IAppendUserTmsQueryQuery {
  params: IAppendUserTmsQueryParams
  result: IAppendUserTmsQueryResult
}

const appendUserTmsQueryIR: any = {
  name: 'appendUserTmsQuery',
  params: [
    {
      name: 'teamId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 81, b: 86, line: 5, col: 30}]}
    },
    {
      name: 'id',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 101, b: 102, line: 6, col: 12}]}
    }
  ],
  usedParamSet: {teamId: true, id: true},
  statement: {
    body: 'UPDATE "User" SET\n  tms = arr_append_uniq(tms, :teamId)\nWHERE id = :id',
    loc: {a: 33, b: 102, line: 4, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" SET
 *   tms = arr_append_uniq(tms, :teamId)
 * WHERE id = :id
 * ```
 */
export const appendUserTmsQuery = new PreparedQuery<
  IAppendUserTmsQueryParams,
  IAppendUserTmsQueryResult
>(appendUserTmsQueryIR)
