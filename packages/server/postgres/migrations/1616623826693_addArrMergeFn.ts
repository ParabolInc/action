import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION arr_merge(a1 anyarray, a2 anyarray)
    RETURNS anyarray AS $$
      SELECT ARRAY_AGG(a ORDER BY a) FROM (
        SELECT DISTINCT UNNEST($1 || $2) AS a
      ) s;
    $$ LANGUAGE SQL STRICT;
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP FUNCTION arr_merge(a1 anyarray, a2 anyarray)
  `)
}
