/*
  @name insertUserQuery
*/
INSERT INTO "User" (
  "id",
  "email",
  "createdAt", 
  "updatedAt",
  "inactive",
  "lastSeenAt",
  "preferredName",
  "tier",
  "picture",
  "tms",
  "featureFlags",
  "lastSeenAtURLs",
  "identities"
) VALUES (
  :id,
  :email,
  :createdAt,
  :updatedAt,
  :inactive,
  :lastSeenAt,
  :preferredName,
  :tier,
  :picture,
  :tms,
  :featureFlags,
  :lastSeenAtURLs,
  :identities
);
