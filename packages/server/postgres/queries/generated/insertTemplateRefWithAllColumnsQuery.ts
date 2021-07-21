/** Types generated for queries found in "packages/server/postgres/queries/src/insertTemplateRefWithAllColumnsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type Json = null | boolean | number | string | Json[] | {[key: string]: Json}

/** 'InsertTemplateRefWithAllColumnsQuery' parameters type */
export interface IInsertTemplateRefWithAllColumnsQueryParams {
  refs: Array<{
    id: string | null | void
    template: Json | null | void
    createdAt: Date | null | void
  }>
}

/** 'InsertTemplateRefWithAllColumnsQuery' return type */
export type IInsertTemplateRefWithAllColumnsQueryResult = void

/** 'InsertTemplateRefWithAllColumnsQuery' query type */
export interface IInsertTemplateRefWithAllColumnsQueryQuery {
  params: IInsertTemplateRefWithAllColumnsQueryParams
  result: IInsertTemplateRefWithAllColumnsQueryResult
}

const insertTemplateRefWithAllColumnsQueryIR: any = {
  name: 'insertTemplateRefWithAllColumnsQuery',
  params: [
    {
      name: 'refs',
      codeRefs: {
        defined: {a: 57, b: 60, line: 3, col: 9},
        used: [{a: 189, b: 192, line: 13, col: 10}]
      },
      transform: {type: 'pick_array_spread', keys: ['id', 'template', 'createdAt']}
    }
  ],
  usedParamSet: {refs: true},
  statement: {
    body: 'INSERT INTO "TemplateRef" (\n  "id",\n  "template",\n  "createdAt"\n) VALUES :refs',
    loc: {a: 115, b: 192, line: 9, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "TemplateRef" (
 *   "id",
 *   "template",
 *   "createdAt"
 * ) VALUES :refs
 * ```
 */
export const insertTemplateRefWithAllColumnsQuery = new PreparedQuery<
  IInsertTemplateRefWithAllColumnsQueryParams,
  IInsertTemplateRefWithAllColumnsQueryResult
>(insertTemplateRefWithAllColumnsQueryIR)
