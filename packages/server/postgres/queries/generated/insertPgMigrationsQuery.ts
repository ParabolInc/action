/** Types generated for queries found in "packages/server/postgres/queries/src/insertPgMigrationsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'InsertPgMigrationsQuery' parameters type */
export interface IInsertPgMigrationsQueryParams {
  migrationRows: Array<{
    name: string | null | void
    run_on: Date | null | void
  }>
}

/** 'InsertPgMigrationsQuery' return type */
export type IInsertPgMigrationsQueryResult = void

/** 'InsertPgMigrationsQuery' query type */
export interface IInsertPgMigrationsQueryQuery {
  params: IInsertPgMigrationsQueryParams
  result: IInsertPgMigrationsQueryResult
}

const insertPgMigrationsQueryIR: any = {
  name: 'insertPgMigrationsQuery',
  params: [
    {
      name: 'migrationRows',
      codeRefs: {
        defined: {a: 44, b: 56, line: 3, col: 9},
        used: [{a: 144, b: 156, line: 8, col: 10}]
      },
      transform: {type: 'pick_array_spread', keys: ['name', 'run_on']}
    }
  ],
  usedParamSet: {migrationRows: true},
  statement: {
    body: 'INSERT INTO "PgMigrations" (\n  "name",\n  "run_on"\n) VALUES :migrationRows',
    loc: {a: 84, b: 156, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "PgMigrations" (
 *   "name",
 *   "run_on"
 * ) VALUES :migrationRows
 * ```
 */
export const insertPgMigrationsQuery = new PreparedQuery<
  IInsertPgMigrationsQueryParams,
  IInsertPgMigrationsQueryResult
>(insertPgMigrationsQueryIR)
