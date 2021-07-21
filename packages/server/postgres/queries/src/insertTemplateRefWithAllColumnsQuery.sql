/*
  @name insertTemplateRefWithAllColumnsQuery
  @param refs -> ((
    id,
    template,
    createdAt
  )...)
*/
INSERT INTO "TemplateRef" (
  "id",
  "template",
  "createdAt"
) VALUES :refs;
