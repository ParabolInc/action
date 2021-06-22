/*
  @name appendUserFeatureFlagsQuery
  @param ids -> (...)
*/
UPDATE "User" SET
  "featureFlags" = arr_append_uniq("featureFlags", :flag)
WHERE id IN :ids;
