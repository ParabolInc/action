/*
  @name removeGitHubAuthQuery
*/
UPDATE "GitHubAuth"
SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE;
