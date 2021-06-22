import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MeetingTypeEnum') THEN
        CREATE TYPE "MeetingTypeEnum" AS ENUM (
          'action',
          'retrospective',
          'poker'
        );
      END IF;
    END
    $$;

    CREATE TABLE IF NOT EXISTS "Team" (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "createdBy" VARCHAR(100),
      "isArchived" BOOLEAN NOT NULL DEFAULT FALSE,
      "isPaid" BOOLEAN NOT NULL DEFAULT TRUE,
      "jiraDimensionFields" JSONB[] NOT NULL DEFAULT '{}',
      "lastMeetingType" "MeetingTypeEnum" NOT NULL DEFAULT 'retrospective',
      tier "TierEnum" NOT NULL,
      "orgId" VARCHAR(100) NOT NULL,
      "isOnboardTeam" BOOLEAN NOT NULL DEFAULT FALSE,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS "idx_Team_orgId" ON "Team"("orgId");
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE "Team";
    DROP TYPE "MeetingTypeEnum";
  `)
}
