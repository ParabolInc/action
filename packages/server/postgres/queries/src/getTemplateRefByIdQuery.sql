/*
  @name getTemplateRefByIdQuery
*/
SELECT t."id", t."createdAt", s."name", s."dimensions"
FROM "TemplateRef" as t, jsonb_to_record(t."template") as s("name" text, "dimensions" json)
WHERE t."id" = :refId;
