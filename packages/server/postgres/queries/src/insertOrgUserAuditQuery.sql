/* 
  @name insertOrgUserAuditQuery
  @param auditRows -> ((orgId, userId, eventDate, eventType)...)
*/
INSERT INTO "OrganizationUserAudit" (
  "orgId",
  "userId",
  "eventDate",
  "eventType"
) VALUES :auditRows;
