/*
  @name getGitHubAuthByTeamIdQuery
  @param teamIds -> (...)
*/
SELECT * FROM "GitHubAuth"
WHERE "teamId" IN :teamIds;
