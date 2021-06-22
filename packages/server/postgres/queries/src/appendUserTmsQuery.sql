/*
  @name appendUserTmsQuery
*/
UPDATE "User" SET
  tms = arr_append_uniq(tms, :teamId)
WHERE id = :id;
