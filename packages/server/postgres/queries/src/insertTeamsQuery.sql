/*
  @name insertTeamsQuery
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
    updatedAt,
    lockMessageHTML
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
  "updatedAt",
  "lockMessageHTML"
) VALUES :teams;
