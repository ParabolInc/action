/*
  @name insertGitHubAuthWithAllColumnsQuery
  @param auths -> ((
    accessToken,
    createdAt,
    updatedAt,
    isActive,
    login,
    teamId,
    userId,
    githubSearchQueries,
    scope
  )...)
*/
INSERT INTO "GitHubAuth" (
  "accessToken",
  "createdAt",
  "updatedAt",
  "isActive",
  "login",
  "teamId",
  "userId",
  "githubSearchQueries",
  "scope"
)
VALUES :auths;
