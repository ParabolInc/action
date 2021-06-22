/*
  @name getTeamsByOrgIdQuery
  @param orgIds -> (...)
*/
SELECT * FROM "Team"
WHERE "orgId" IN :orgIds
AND (CAST(:isArchived AS BOOLEAN) IS NULL OR "isArchived" = :isArchived);
