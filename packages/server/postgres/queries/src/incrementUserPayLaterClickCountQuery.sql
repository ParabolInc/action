/*
  @name incrementUserPayLaterClickCountQuery
*/

UPDATE "User" SET
  "payLaterClickCount" = "payLaterClickCount" + 1
WHERE id = :id;
