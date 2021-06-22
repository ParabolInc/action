/*
  @name updateUserQuery
  @param ids -> (...)
*/
UPDATE "User" SET
  email = COALESCE(:email, "email"),
  "updatedAt" = COALESCE(:updatedAt, "updatedAt"),
  inactive = COALESCE(:inactive, "inactive"),
  "lastSeenAt" = COALESCE(:lastSeenAt, "lastSeenAt"),
  "preferredName" = COALESCE(:preferredName, "preferredName"),
  tier = COALESCE(:tier, "tier"),
  picture = COALESCE(:picture, "picture"),
  "segmentId" = COALESCE(:segmentId, "segmentId"),
  "isRemoved" = COALESCE(:isRemoved, "isRemoved"),
  "reasonRemoved" = COALESCE(:reasonRemoved, "reasonRemoved"),
  "newFeatureId" = COALESCE(:newFeatureId, "newFeatureId"),
  "identities" = COALESCE(:identities, "identities"),
  "overLimitCopy" = COALESCE(:overLimitCopy, "overLimitCopy")
WHERE id IN :ids;
