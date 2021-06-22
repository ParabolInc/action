/** Types generated for queries found in "packages/server/postgres/queries/src/getTemplateScaleRefByIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type Json = null | boolean | number | string | Json[] | {[key: string]: Json}

/** 'GetTemplateScaleRefByIdQuery' parameters type */
export interface IGetTemplateScaleRefByIdQueryParams {
  scaleRefId: string | null | void
}

/** 'GetTemplateScaleRefByIdQuery' return type */
export interface IGetTemplateScaleRefByIdQueryResult {
  id: string
  createdAt: Date | null
  name: string | null
  values: Json | null
}

/** 'GetTemplateScaleRefByIdQuery' query type */
export interface IGetTemplateScaleRefByIdQueryQuery {
  params: IGetTemplateScaleRefByIdQueryParams
  result: IGetTemplateScaleRefByIdQueryResult
}

const getTemplateScaleRefByIdQueryIR: any = {
  name: 'getTemplateScaleRefByIdQuery',
  params: [
    {
      name: 'scaleRefId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 198, b: 207, line: 6, col: 14}]}
    }
  ],
  usedParamSet: {scaleRefId: true},
  statement: {
    body:
      'SELECT t."id", t."createdAt", s."name", s."values"\nFROM "TemplateScaleRef" as t, jsonb_to_record(t."scale") as s("name" text, "values" json)\nWHERE "id" = :scaleRefId',
    loc: {a: 43, b: 207, line: 4, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT t."id", t."createdAt", s."name", s."values"
 * FROM "TemplateScaleRef" as t, jsonb_to_record(t."scale") as s("name" text, "values" json)
 * WHERE "id" = :scaleRefId
 * ```
 */
export const getTemplateScaleRefByIdQuery = new PreparedQuery<
  IGetTemplateScaleRefByIdQueryParams,
  IGetTemplateScaleRefByIdQueryResult
>(getTemplateScaleRefByIdQueryIR)
