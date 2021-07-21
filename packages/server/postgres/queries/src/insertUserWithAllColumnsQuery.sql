
/*
  @name insertUserWithAllColumnsQuery
  @param users -> ((
    id,
    email,
    createdAt,
    updatedAt,
    inactive,
    lastSeenAt,
    preferredName,
    tier,
    picture,
    tms,
    featureFlags,
    identities,
    lastSeenAtURLs,
    segmentId,
    newFeatureId,
    overLimitCopy,
    isRemoved,
    reasonRemoved,
    rol,
    payLaterClickCount
  )...)
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
  "identities",
  "lastSeenAtURLs",
  "segmentId",
  "newFeatureId",
  "overLimitCopy",
  "isRemoved",
  "reasonRemoved",
  "rol",
  "payLaterClickCount"
) VALUES :users;
