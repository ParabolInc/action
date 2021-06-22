/** Types generated for queries found in "packages/server/postgres/queries/src/incrementUserPayLaterClickCountQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'IncrementUserPayLaterClickCountQuery' parameters type */
export interface IIncrementUserPayLaterClickCountQueryParams {
  id: string | null | void
}

/** 'IncrementUserPayLaterClickCountQuery' return type */
export type IIncrementUserPayLaterClickCountQueryResult = void

/** 'IncrementUserPayLaterClickCountQuery' query type */
export interface IIncrementUserPayLaterClickCountQueryQuery {
  params: IIncrementUserPayLaterClickCountQueryParams
  result: IIncrementUserPayLaterClickCountQueryResult
}

const incrementUserPayLaterClickCountQueryIR: any = {
  name: 'incrementUserPayLaterClickCountQuery',
  params: [
    {
      name: 'id',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 132, b: 133, line: 7, col: 12}]}
    }
  ],
  usedParamSet: {id: true},
  statement: {
    body: 'UPDATE "User" SET\n  "payLaterClickCount" = "payLaterClickCount" + 1\nWHERE id = :id',
    loc: {a: 52, b: 133, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" SET
 *   "payLaterClickCount" = "payLaterClickCount" + 1
 * WHERE id = :id
 * ```
 */
export const incrementUserPayLaterClickCountQuery = new PreparedQuery<
  IIncrementUserPayLaterClickCountQueryParams,
  IIncrementUserPayLaterClickCountQueryResult
>(incrementUserPayLaterClickCountQueryIR)
