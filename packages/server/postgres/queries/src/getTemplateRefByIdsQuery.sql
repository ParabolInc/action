/*
  @name getTemplateRefByIdsQuery
  @param ids -> (...)
*/
SELECT * FROM "TemplateRef"
WHERE id IN :ids;
