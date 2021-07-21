/*
  @name getTemplateScaleRefByIdsQuery
  @param ids -> (...)
*/
SELECT * FROM "TemplateScaleRef"
WHERE id IN :ids;
