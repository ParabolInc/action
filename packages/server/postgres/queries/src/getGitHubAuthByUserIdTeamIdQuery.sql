/*
  @name getGitHubAuthByUserIdTeamIdQuery
*/
SELECT * from "GitHubAuth"
WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE;
