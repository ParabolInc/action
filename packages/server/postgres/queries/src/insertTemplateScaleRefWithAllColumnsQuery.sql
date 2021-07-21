/*
  @name insertTemplateScaleRefWithAllColumnsQuery
  @param refs -> ((
    id,
    scale,
    createdAt
  )...)
*/
INSERT INTO "TemplateScaleRef" (
  "id",
  "scale",
  "createdAt"
) VALUES :refs;
