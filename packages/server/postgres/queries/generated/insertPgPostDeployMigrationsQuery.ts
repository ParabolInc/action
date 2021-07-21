/** Types generated for queries found in "packages/server/postgres/queries/src/insertPgPostDeployMigrationsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'InsertPgPostDeployMigrationsQuery' parameters type */
export interface IInsertPgPostDeployMigrationsQueryParams {
  migrationRows: Array<{
    name: string | null | void
    run_on: Date | null | void
  }>
}

/** 'InsertPgPostDeployMigrationsQuery' return type */
export type IInsertPgPostDeployMigrationsQueryResult = void

/** 'InsertPgPostDeployMigrationsQuery' query type */
export interface IInsertPgPostDeployMigrationsQueryQuery {
  params: IInsertPgPostDeployMigrationsQueryParams
  result: IInsertPgPostDeployMigrationsQueryResult
}

const insertPgPostDeployMigrationsQueryIR: any = {
  name: 'insertPgPostDeployMigrationsQuery',
  params: [
    {
      name: 'migrationRows',
      codeRefs: {
        defined: {a: 54, b: 66, line: 3, col: 9},
        used: [{a: 164, b: 176, line: 8, col: 10}]
      },
      transform: {type: 'pick_array_spread', keys: ['name', 'run_on']}
    }
  ],
  usedParamSet: {migrationRows: true},
  statement: {
    body: 'INSERT INTO "PgPostDeployMigrations" (\n  "name",\n  "run_on"\n) VALUES :migrationRows',
    loc: {a: 94, b: 176, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "PgPostDeployMigrations" (
 *   "name",
 *   "run_on"
 * ) VALUES :migrationRows
 * ```
 */
export const insertPgPostDeployMigrationsQuery = new PreparedQuery<
  IInsertPgPostDeployMigrationsQueryParams,
  IInsertPgPostDeployMigrationsQueryResult
>(insertPgPostDeployMigrationsQueryIR)
