/*
  @name getTeamsByOrgIdQuery
  @param orgIds -> (...)
*/
SELECT * FROM "Team"
WHERE "orgId" IN :orgIds;
