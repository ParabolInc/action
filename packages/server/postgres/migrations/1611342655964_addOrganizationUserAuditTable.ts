import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrganizationUserAuditEventTypeEnum') THEN
        CREATE TYPE "OrganizationUserAuditEventTypeEnum" AS ENUM (
          'added',
          'activated',
          'inactivated',
          'removed'
        );
      END IF;
      CREATE TABLE IF NOT EXISTS "OrganizationUserAudit" (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "orgId" VARCHAR(100) NOT NULL,
        "userId" VARCHAR(100) NOT NULL,
        "eventDate" TIMESTAMP NOT NULL,
        "eventType" "OrganizationUserAuditEventTypeEnum" NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "idx_OrganizationUserAudit_orgId" ON "OrganizationUserAudit"("orgId");
    END
    $$;
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.sql(`
    DROP TYPE "OrganizationUserAuditEventTypeEnum" CASCADE;
    DROP TABLE "OrganizationUserAudit";
  `)
}
