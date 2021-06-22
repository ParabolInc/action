/** Types generated for queries found in "packages/server/postgres/queries/src/mergeTeamJiraDimensionFieldsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'MergeTeamJiraDimensionFieldsQuery' parameters type */
export interface IMergeTeamJiraDimensionFieldsQueryParams {
  jiraDimensionFields: JsonArray | null | void
  id: string | null | void
}

/** 'MergeTeamJiraDimensionFieldsQuery' return type */
export type IMergeTeamJiraDimensionFieldsQueryResult = void

/** 'MergeTeamJiraDimensionFieldsQuery' query type */
export interface IMergeTeamJiraDimensionFieldsQueryQuery {
  params: IMergeTeamJiraDimensionFieldsQueryParams
  result: IMergeTeamJiraDimensionFieldsQueryResult
}

const mergeTeamJiraDimensionFieldsQueryIR: any = {
  name: 'mergeTeamJiraDimensionFieldsQuery',
  params: [
    {
      name: 'jiraDimensionFields',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 126, b: 144, line: 5, col: 60}]}
    },
    {
      name: 'id',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 161, b: 162, line: 6, col: 14}]}
    }
  ],
  usedParamSet: {jiraDimensionFields: true, id: true},
  statement: {
    body:
      'UPDATE "Team" SET\n  "jiraDimensionFields" = arr_merge("jiraDimensionFields", :jiraDimensionFields)\nWHERE "id" = :id',
    loc: {a: 48, b: 162, line: 4, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "Team" SET
 *   "jiraDimensionFields" = arr_merge("jiraDimensionFields", :jiraDimensionFields)
 * WHERE "id" = :id
 * ```
 */
export const mergeTeamJiraDimensionFieldsQuery = new PreparedQuery<
  IMergeTeamJiraDimensionFieldsQueryParams,
  IMergeTeamJiraDimensionFieldsQueryResult
>(mergeTeamJiraDimensionFieldsQueryIR)
