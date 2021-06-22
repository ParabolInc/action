/*
  @name backupTeamQuery
  @param teams -> ((
    id,
    name,
    createdAt,
    createdBy,
    isArchived,
    isPaid,
    jiraDimensionFields,
    lastMeetingType,
    tier,
    orgId,
    isOnboardTeam,
    updatedAt
  )...)
*/
INSERT INTO "Team" (
    "id",
    "name",
    "createdAt",
    "createdBy",
    "isArchived",
    "isPaid",
    "jiraDimensionFields",
    "lastMeetingType",
    "tier",
    "orgId",
    "isOnboardTeam",
    "updatedAt"
) VALUES :teams
ON CONFLICT (id) DO UPDATE SET
  "id" = EXCLUDED."id",
  "name" = EXCLUDED."name",
  "createdAt" = EXCLUDED."createdAt",
  "createdBy" = EXCLUDED."createdBy",
  "isArchived" = EXCLUDED."isArchived",
  "isPaid" = EXCLUDED."isPaid",
  "jiraDimensionFields" = EXCLUDED."jiraDimensionFields",
  "lastMeetingType" = EXCLUDED."lastMeetingType",
  "tier" = EXCLUDED."tier",
  "orgId" = EXCLUDED."orgId",
  "isOnboardTeam" = EXCLUDED."isOnboardTeam",
  "updatedAt" = EXCLUDED."updatedAt"
;
