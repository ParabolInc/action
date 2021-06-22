/** Types generated for queries found in "packages/server/postgres/queries/src/addUserNewFeatureQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'AddUserNewFeatureQuery' parameters type */
export interface IAddUserNewFeatureQueryParams {
  newFeatureId: string | null | void
}

/** 'AddUserNewFeatureQuery' return type */
export type IAddUserNewFeatureQueryResult = void

/** 'AddUserNewFeatureQuery' query type */
export interface IAddUserNewFeatureQueryQuery {
  params: IAddUserNewFeatureQueryParams
  result: IAddUserNewFeatureQueryResult
}

const addUserNewFeatureQueryIR: any = {
  name: 'addUserNewFeatureQuery',
  params: [
    {
      name: 'newFeatureId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 75, b: 86, line: 5, col: 20}]}
    }
  ],
  usedParamSet: {newFeatureId: true},
  statement: {
    body: 'UPDATE "User" SET\n  "newFeatureId" = :newFeatureId',
    loc: {a: 37, b: 86, line: 4, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" SET
 *   "newFeatureId" = :newFeatureId
 * ```
 */
export const addUserNewFeatureQuery = new PreparedQuery<
  IAddUserNewFeatureQueryParams,
  IAddUserNewFeatureQueryResult
>(addUserNewFeatureQueryIR)
