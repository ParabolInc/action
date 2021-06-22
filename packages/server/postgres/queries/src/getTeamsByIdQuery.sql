/*
  @name getTeamsByIdQuery
  @param ids -> (...)
*/
SELECT * FROM "Team"
WHERE id IN :ids;
