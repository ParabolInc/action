/** Types generated for queries found in "packages/server/postgres/queries/src/insertTemplateScaleRefQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type Json = null | boolean | number | string | Json[] | {[key: string]: Json}

/** 'InsertTemplateScaleRefQuery' parameters type */
export interface IInsertTemplateScaleRefQueryParams {
  templateScales: Array<{
    id: string | null | void
    scale: Json | null | void
  }>
}

/** 'InsertTemplateScaleRefQuery' return type */
export type IInsertTemplateScaleRefQueryResult = void

/** 'InsertTemplateScaleRefQuery' query type */
export interface IInsertTemplateScaleRefQueryQuery {
  params: IInsertTemplateScaleRefQueryParams
  result: IInsertTemplateScaleRefQueryResult
}

const insertTemplateScaleRefQueryIR: any = {
  name: 'insertTemplateScaleRefQuery',
  params: [
    {
      name: 'templateScales',
      codeRefs: {
        defined: {a: 48, b: 61, line: 3, col: 9},
        used: [{a: 147, b: 160, line: 9, col: 8}]
      },
      transform: {type: 'pick_array_spread', keys: ['id', 'scale']}
    }
  ],
  usedParamSet: {templateScales: true},
  statement: {
    body:
      'INSERT INTO "TemplateScaleRef" (\n  "id",\n  "scale"\n)\nVALUES :templateScales\nON CONFLICT (id)\nDO NOTHING',
    loc: {a: 86, b: 188, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "TemplateScaleRef" (
 *   "id",
 *   "scale"
 * )
 * VALUES :templateScales
 * ON CONFLICT (id)
 * DO NOTHING
 * ```
 */
export const insertTemplateScaleRefQuery = new PreparedQuery<
  IInsertTemplateScaleRefQueryParams,
  IInsertTemplateScaleRefQueryResult
>(insertTemplateScaleRefQueryIR)
