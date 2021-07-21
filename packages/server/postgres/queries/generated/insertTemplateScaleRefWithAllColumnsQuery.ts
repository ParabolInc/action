/** Types generated for queries found in "packages/server/postgres/queries/src/insertTemplateScaleRefWithAllColumnsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type Json = null | boolean | number | string | Json[] | {[key: string]: Json}

/** 'InsertTemplateScaleRefWithAllColumnsQuery' parameters type */
export interface IInsertTemplateScaleRefWithAllColumnsQueryParams {
  refs: Array<{
    id: string | null | void
    scale: Json | null | void
    createdAt: Date | null | void
  }>
}

/** 'InsertTemplateScaleRefWithAllColumnsQuery' return type */
export type IInsertTemplateScaleRefWithAllColumnsQueryResult = void

/** 'InsertTemplateScaleRefWithAllColumnsQuery' query type */
export interface IInsertTemplateScaleRefWithAllColumnsQueryQuery {
  params: IInsertTemplateScaleRefWithAllColumnsQueryParams
  result: IInsertTemplateScaleRefWithAllColumnsQueryResult
}

const insertTemplateScaleRefWithAllColumnsQueryIR: any = {
  name: 'insertTemplateScaleRefWithAllColumnsQuery',
  params: [
    {
      name: 'refs',
      codeRefs: {
        defined: {a: 62, b: 65, line: 3, col: 9},
        used: [{a: 193, b: 196, line: 13, col: 10}]
      },
      transform: {type: 'pick_array_spread', keys: ['id', 'scale', 'createdAt']}
    }
  ],
  usedParamSet: {refs: true},
  statement: {
    body: 'INSERT INTO "TemplateScaleRef" (\n  "id",\n  "scale",\n  "createdAt"\n) VALUES :refs',
    loc: {a: 117, b: 196, line: 9, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "TemplateScaleRef" (
 *   "id",
 *   "scale",
 *   "createdAt"
 * ) VALUES :refs
 * ```
 */
export const insertTemplateScaleRefWithAllColumnsQuery = new PreparedQuery<
  IInsertTemplateScaleRefWithAllColumnsQueryParams,
  IInsertTemplateScaleRefWithAllColumnsQueryResult
>(insertTemplateScaleRefWithAllColumnsQueryIR)
