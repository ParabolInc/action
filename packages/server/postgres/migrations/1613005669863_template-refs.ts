import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.sql(`
    CREATE TABLE IF NOT EXISTS "TemplateScaleRef" (
      "id" CHAR(24) PRIMARY KEY,
      "scale" JSONB NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS "TemplateRef" (
      "id" CHAR(24) PRIMARY KEY,
      "template" JSONB NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.sql(`
  DROP TABLE "TemplateScaleRef";
  DROP TABLE "TemplateRef";
  `)
}
