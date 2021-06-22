/*
  @name insertGitHubAuthsQuery
  @param auths -> ((accessToken, createdAt, updatedAt, isActive, login, teamId, userId)...)
*/
INSERT INTO "GitHubAuth" ("accessToken", "createdAt", "updatedAt", "isActive", "login", "teamId", "userId")
VALUES :auths;
