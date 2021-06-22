/*
  @name insertTemplateScaleRefQuery
  @param templateScales -> ((id, scale)...)
*/
INSERT INTO "TemplateScaleRef" (
  "id",
  "scale"
)
VALUES :templateScales
ON CONFLICT (id)
DO NOTHING;
