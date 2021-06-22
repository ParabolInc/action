/** Types generated for queries found in "packages/server/postgres/queries/src/getTemplateRefByIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type Json = null | boolean | number | string | Json[] | {[key: string]: Json}

/** 'GetTemplateRefByIdQuery' parameters type */
export interface IGetTemplateRefByIdQueryParams {
  refId: string | null | void
}

/** 'GetTemplateRefByIdQuery' return type */
export interface IGetTemplateRefByIdQueryResult {
  id: string
  createdAt: Date | null
  name: string | null
  dimensions: Json | null
}

/** 'GetTemplateRefByIdQuery' query type */
export interface IGetTemplateRefByIdQueryQuery {
  params: IGetTemplateRefByIdQueryParams
  result: IGetTemplateRefByIdQueryResult
}

const getTemplateRefByIdQueryIR: any = {
  name: 'getTemplateRefByIdQuery',
  params: [
    {
      name: 'refId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 201, b: 205, line: 6, col: 16}]}
    }
  ],
  usedParamSet: {refId: true},
  statement: {
    body:
      'SELECT t."id", t."createdAt", s."name", s."dimensions"\nFROM "TemplateRef" as t, jsonb_to_record(t."template") as s("name" text, "dimensions" json)\nWHERE t."id" = :refId',
    loc: {a: 38, b: 205, line: 4, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT t."id", t."createdAt", s."name", s."dimensions"
 * FROM "TemplateRef" as t, jsonb_to_record(t."template") as s("name" text, "dimensions" json)
 * WHERE t."id" = :refId
 * ```
 */
export const getTemplateRefByIdQuery = new PreparedQuery<
  IGetTemplateRefByIdQueryParams,
  IGetTemplateRefByIdQueryResult
>(getTemplateRefByIdQueryIR)
