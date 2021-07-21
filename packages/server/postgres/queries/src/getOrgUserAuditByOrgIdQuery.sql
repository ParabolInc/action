/*
  @name getOrgUserAuditByOrgIdQuery
  @param orgIds -> (...)
*/
SELECT * FROM "OrganizationUserAudit"
WHERE "orgId" in :orgIds;
