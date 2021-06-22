/*
  @name insertTeamQuery
*/
INSERT INTO "Team" (
  "id",
  "name",
  "createdAt",
  "createdBy",
  "isArchived",
  "isPaid",
  "lastMeetingType",
  "tier",
  "orgId",
  "isOnboardTeam",
  "updatedAt"
) VALUES (
  :id,
  :name,
  :createdAt,
  :createdBy,
  :isArchived,
  :isPaid,
  :lastMeetingType,
  :tier,
  :orgId,
  :isOnboardTeam,
  :updatedAt
);
