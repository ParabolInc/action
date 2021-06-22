/*
  @name mergeTeamJiraDimensionFieldsQuery
*/
UPDATE "Team" SET
  "jiraDimensionFields" = arr_merge("jiraDimensionFields", :jiraDimensionFields)
WHERE "id" = :id;
