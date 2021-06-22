import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION arr_diff(arr1 anyarray, arr2 anyarray)
    RETURNS anyarray LANGUAGE sql IMMUTABLE AS $$
      SELECT COALESCE(array_agg(el), '{}')
      FROM UNNEST(arr1) el
      WHERE el != all(arr2)
    $$;
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP FUNCTION arr_diff(arr1 anyarray, arr2 anyarray)
  `)
}
