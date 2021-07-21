/** Types generated for queries found in "packages/server/postgres/queries/src/getTemplateScaleRefByIdsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type Json = null | boolean | number | string | Json[] | {[key: string]: Json}

/** 'GetTemplateScaleRefByIdsQuery' parameters type */
export interface IGetTemplateScaleRefByIdsQueryParams {
  ids: Array<string | null | void>
}

/** 'GetTemplateScaleRefByIdsQuery' return type */
export interface IGetTemplateScaleRefByIdsQueryResult {
  id: string
  scale: Json
  createdAt: Date | null
}

/** 'GetTemplateScaleRefByIdsQuery' query type */
export interface IGetTemplateScaleRefByIdsQueryQuery {
  params: IGetTemplateScaleRefByIdsQueryParams
  result: IGetTemplateScaleRefByIdsQueryResult
}

const getTemplateScaleRefByIdsQueryIR: any = {
  name: 'getTemplateScaleRefByIdsQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 50, b: 52, line: 3, col: 9},
        used: [{a: 112, b: 114, line: 6, col: 13}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {ids: true},
  statement: {
    body: 'SELECT * FROM "TemplateScaleRef"\nWHERE id IN :ids',
    loc: {a: 66, b: 114, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "TemplateScaleRef"
 * WHERE id IN :ids
 * ```
 */
export const getTemplateScaleRefByIdsQuery = new PreparedQuery<
  IGetTemplateScaleRefByIdsQueryParams,
  IGetTemplateScaleRefByIdsQueryResult
>(getTemplateScaleRefByIdsQueryIR)
