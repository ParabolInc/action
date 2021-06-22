import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION arr_append_uniq(anyarray, anyelement)
      RETURNS anyarray LANGUAGE sql IMMUTABLE AS
      'SELECT CASE WHEN array_position($1, $2) iS NULL THEN $1 || $2 ELSE $1 END;'
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP FUNCTION arr_append_uniq(anyarray, anyelement)
  `)
}
