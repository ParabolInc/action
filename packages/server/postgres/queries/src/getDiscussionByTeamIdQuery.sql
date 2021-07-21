/*
  @name getDiscussionByTeamIdQuery
  @param teamIds -> (...)
*/
SELECT * FROM "Discussion"
WHERE "teamId" IN :teamIds;
