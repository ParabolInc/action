/*
  @name upsertGitHubAuthQuery
  @param auth -> (accessToken, login, teamId, userId)
*/
INSERT INTO "GitHubAuth" ("accessToken", "login", "teamId", "userId")
VALUES :auth
ON CONFLICT ("userId", "teamId")
DO UPDATE
SET ("accessToken", "updatedAt", "isActive", "login") = (EXCLUDED."accessToken", CURRENT_TIMESTAMP, TRUE, EXCLUDED.login);
