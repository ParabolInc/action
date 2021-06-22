/*
  @name insertTemplateRefQuery
  @param ref -> (id, template)
*/
INSERT INTO "TemplateRef" (
  "id",
  "template"
)
VALUES :ref
ON CONFLICT (id)
DO NOTHING;
