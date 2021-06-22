/** Types generated for queries found in "packages/server/postgres/queries/src/appendUserFeatureFlagsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'AppendUserFeatureFlagsQuery' parameters type */
export interface IAppendUserFeatureFlagsQueryParams {
  ids: Array<string | null | void>
  flag: string | null | void
}

/** 'AppendUserFeatureFlagsQuery' return type */
export type IAppendUserFeatureFlagsQueryResult = void

/** 'AppendUserFeatureFlagsQuery' query type */
export interface IAppendUserFeatureFlagsQueryQuery {
  params: IAppendUserFeatureFlagsQueryParams
  result: IAppendUserFeatureFlagsQueryResult
}

const appendUserFeatureFlagsQueryIR: any = {
  name: 'appendUserFeatureFlagsQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 48, b: 50, line: 3, col: 9},
        used: [{a: 153, b: 155, line: 7, col: 13}]
      },
      transform: {type: 'array_spread'}
    },
    {
      name: 'flag',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 134, b: 137, line: 6, col: 52}]}
    }
  ],
  usedParamSet: {flag: true, ids: true},
  statement: {
    body:
      'UPDATE "User" SET\n  "featureFlags" = arr_append_uniq("featureFlags", :flag)\nWHERE id IN :ids',
    loc: {a: 64, b: 155, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" SET
 *   "featureFlags" = arr_append_uniq("featureFlags", :flag)
 * WHERE id IN :ids
 * ```
 */
export const appendUserFeatureFlagsQuery = new PreparedQuery<
  IAppendUserFeatureFlagsQueryParams,
  IAppendUserFeatureFlagsQueryResult
>(appendUserFeatureFlagsQueryIR)
