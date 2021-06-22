/*
  @name updateTeamByOrgIdQuery
*/
UPDATE "Team" SET
  "name" = COALESCE(:name, "name"),
  "isArchived" = COALESCE(:isArchived, "isArchived"),
  "isPaid" = COALESCE(:isPaid, "isPaid"),
  "jiraDimensionFields" = COALESCE(:jiraDimensionFields, "jiraDimensionFields"),
  "lastMeetingType" = COALESCE(:lastMeetingType, "lastMeetingType"),
  "tier" = COALESCE(:tier, "tier"),
  "orgId" = COALESCE(:orgId, "orgId"),
  "updatedAt" = COALESCE(:updatedAt, "updatedAt")
WHERE "orgId" = :orgId
RETURNING "id";
