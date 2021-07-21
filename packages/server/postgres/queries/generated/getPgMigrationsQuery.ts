/** Types generated for queries found in "packages/server/postgres/queries/src/getPgMigrationsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'GetPgMigrationsQuery' parameters type */
export type IGetPgMigrationsQueryParams = void

/** 'GetPgMigrationsQuery' return type */
export interface IGetPgMigrationsQueryResult {
  id: number
  name: string
  run_on: Date
}

/** 'GetPgMigrationsQuery' query type */
export interface IGetPgMigrationsQueryQuery {
  params: IGetPgMigrationsQueryParams
  result: IGetPgMigrationsQueryResult
}

const getPgMigrationsQueryIR: any = {
  name: 'getPgMigrationsQuery',
  params: [],
  usedParamSet: {},
  statement: {body: 'SELECT * FROM "PgMigrations"', loc: {a: 35, b: 62, line: 4, col: 0}}
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "PgMigrations"
 * ```
 */
export const getPgMigrationsQuery = new PreparedQuery<
  IGetPgMigrationsQueryParams,
  IGetPgMigrationsQueryResult
>(getPgMigrationsQueryIR)
