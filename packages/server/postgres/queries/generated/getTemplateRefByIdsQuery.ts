/** Types generated for queries found in "packages/server/postgres/queries/src/getTemplateRefByIdsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type Json = null | boolean | number | string | Json[] | {[key: string]: Json}

/** 'GetTemplateRefByIdsQuery' parameters type */
export interface IGetTemplateRefByIdsQueryParams {
  ids: Array<string | null | void>
}

/** 'GetTemplateRefByIdsQuery' return type */
export interface IGetTemplateRefByIdsQueryResult {
  id: string
  template: Json
  createdAt: Date | null
}

/** 'GetTemplateRefByIdsQuery' query type */
export interface IGetTemplateRefByIdsQueryQuery {
  params: IGetTemplateRefByIdsQueryParams
  result: IGetTemplateRefByIdsQueryResult
}

const getTemplateRefByIdsQueryIR: any = {
  name: 'getTemplateRefByIdsQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 45, b: 47, line: 3, col: 9},
        used: [{a: 102, b: 104, line: 6, col: 13}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {ids: true},
  statement: {
    body: 'SELECT * FROM "TemplateRef"\nWHERE id IN :ids',
    loc: {a: 61, b: 104, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "TemplateRef"
 * WHERE id IN :ids
 * ```
 */
export const getTemplateRefByIdsQuery = new PreparedQuery<
  IGetTemplateRefByIdsQueryParams,
  IGetTemplateRefByIdsQueryResult
>(getTemplateRefByIdsQueryIR)
