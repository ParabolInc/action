/** Types generated for queries found in "packages/server/postgres/queries/src/insertTemplateRefQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type Json = null | boolean | number | string | Json[] | {[key: string]: Json}

/** 'InsertTemplateRefQuery' parameters type */
export interface IInsertTemplateRefQueryParams {
  ref: {
    id: string | null | void
    template: Json | null | void
  }
}

/** 'InsertTemplateRefQuery' return type */
export type IInsertTemplateRefQueryResult = void

/** 'InsertTemplateRefQuery' query type */
export interface IInsertTemplateRefQueryQuery {
  params: IInsertTemplateRefQueryParams
  result: IInsertTemplateRefQueryResult
}

const insertTemplateRefQueryIR: any = {
  name: 'insertTemplateRefQuery',
  params: [
    {
      name: 'ref',
      codeRefs: {
        defined: {a: 43, b: 45, line: 3, col: 9},
        used: [{a: 127, b: 129, line: 9, col: 8}]
      },
      transform: {type: 'pick_tuple', keys: ['id', 'template']}
    }
  ],
  usedParamSet: {ref: true},
  statement: {
    body:
      'INSERT INTO "TemplateRef" (\n  "id",\n  "template"\n)\nVALUES :ref\nON CONFLICT (id)\nDO NOTHING',
    loc: {a: 68, b: 157, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "TemplateRef" (
 *   "id",
 *   "template"
 * )
 * VALUES :ref
 * ON CONFLICT (id)
 * DO NOTHING
 * ```
 */
export const insertTemplateRefQuery = new PreparedQuery<
  IInsertTemplateRefQueryParams,
  IInsertTemplateRefQueryResult
>(insertTemplateRefQueryIR)
