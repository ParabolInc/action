/** Types generated for queries found in "packages/server/postgres/queries/src/getPgPostDeployMigrationsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'GetPgPostDeployMigrationsQuery' parameters type */
export type IGetPgPostDeployMigrationsQueryParams = void

/** 'GetPgPostDeployMigrationsQuery' return type */
export interface IGetPgPostDeployMigrationsQueryResult {
  id: number
  name: string
  run_on: Date
}

/** 'GetPgPostDeployMigrationsQuery' query type */
export interface IGetPgPostDeployMigrationsQueryQuery {
  params: IGetPgPostDeployMigrationsQueryParams
  result: IGetPgPostDeployMigrationsQueryResult
}

const getPgPostDeployMigrationsQueryIR: any = {
  name: 'getPgPostDeployMigrationsQuery',
  params: [],
  usedParamSet: {},
  statement: {body: 'SELECT * FROM "PgPostDeployMigrations"', loc: {a: 45, b: 82, line: 4, col: 0}}
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "PgPostDeployMigrations"
 * ```
 */
export const getPgPostDeployMigrationsQuery = new PreparedQuery<
  IGetPgPostDeployMigrationsQueryParams,
  IGetPgPostDeployMigrationsQueryResult
>(getPgPostDeployMigrationsQueryIR)
