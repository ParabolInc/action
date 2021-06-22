import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE "GitHubAuth"
    DROP COLUMN "githubSearchQueries";
  `)
  await pgm.db.query(`
    ALTER TABLE "GitHubAuth"
    ADD COLUMN "githubSearchQueries" JSONB[] NOT NULL DEFAULT '{}';
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE "GitHubAuth"
    DROP COLUMN "githubSearchQueries";
  `)
}
