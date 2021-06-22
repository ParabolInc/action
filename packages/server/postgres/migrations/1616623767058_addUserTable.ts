import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TierEnum') THEN
        CREATE TYPE "TierEnum" AS ENUM (
          'personal',
          'pro',
          'enterprise'
        );
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuthTokenRole') THEN
        CREATE TYPE "AuthTokenRole" AS ENUM (
          'su'
        );
      END IF;
      CREATE EXTENSION IF NOT EXISTS citext;
      CREATE TABLE IF NOT EXISTS "User" (
        id VARCHAR(100) PRIMARY KEY,
        email "citext" UNIQUE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "inactive" BOOLEAN NOT NULL DEFAULT FALSE,
        "lastSeenAt" TIMESTAMP WITH TIME ZONE,
        "preferredName" VARCHAR(100) NOT NULL,
        tier "TierEnum" NOT NULL DEFAULT 'personal',
        picture text NOT NULL,
        tms VARCHAR(100)[] NOT NULL DEFAULT '{}',
        "featureFlags" VARCHAR(50)[] NOT NULL DEFAULT '{}',
        identities JSONB[] NOT NULL DEFAULT '{}',
        "lastSeenAtURLs" text[],
        "segmentId" VARCHAR(100),
        "newFeatureId" VARCHAR(100),
        "overLimitCopy" VARCHAR(500),
        "isRemoved" BOOLEAN NOT NULL DEFAULT FALSE,
        "reasonRemoved" VARCHAR(2000),
        rol "AuthTokenRole",
        "payLaterClickCount" SMALLINT NOT NULL DEFAULT 0
      );
  END
  $$;
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE "User";
    DROP TYPE "TierEnum";
    DROP TYPE "AuthTokenRole";
    DROP EXTENSION "citext";
  `)
}
