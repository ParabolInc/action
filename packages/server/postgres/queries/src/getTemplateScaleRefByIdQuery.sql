/*
  @name getTemplateScaleRefByIdQuery
*/
SELECT t."id", t."createdAt", s."name", s."values"
FROM "TemplateScaleRef" as t, jsonb_to_record(t."scale") as s("name" text, "values" json)
WHERE "id" = :scaleRefId;
