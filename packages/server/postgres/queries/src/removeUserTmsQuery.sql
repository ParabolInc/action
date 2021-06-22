/*
  @name removeUserTmsQuery
  @param ids -> (...)
*/
UPDATE "User" SET
  tms = arr_diff(tms, :teamIds)
WHERE id IN :ids;
