/*
  @name dismissNewFeatureQuery
  @param ids -> (...)
*/
UPDATE "User" SET
  "newFeatureId" = NULL
WHERE id IN :ids;
