/** Types generated for queries found in "packages/server/postgres/queries/src/dismissNewFeatureQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'DismissNewFeatureQuery' parameters type */
export interface IDismissNewFeatureQueryParams {
  ids: Array<string | null | void>
}

/** 'DismissNewFeatureQuery' return type */
export type IDismissNewFeatureQueryResult = void

/** 'DismissNewFeatureQuery' query type */
export interface IDismissNewFeatureQueryQuery {
  params: IDismissNewFeatureQueryParams
  result: IDismissNewFeatureQueryResult
}

const dismissNewFeatureQueryIR: any = {
  name: 'dismissNewFeatureQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 43, b: 45, line: 3, col: 9},
        used: [{a: 114, b: 116, line: 7, col: 13}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {ids: true},
  statement: {
    body: 'UPDATE "User" SET\n  "newFeatureId" = NULL\nWHERE id IN :ids',
    loc: {a: 59, b: 116, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" SET
 *   "newFeatureId" = NULL
 * WHERE id IN :ids
 * ```
 */
export const dismissNewFeatureQuery = new PreparedQuery<
  IDismissNewFeatureQueryParams,
  IDismissNewFeatureQueryResult
>(dismissNewFeatureQueryIR)
