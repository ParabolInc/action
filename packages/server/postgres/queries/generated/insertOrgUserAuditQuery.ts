/** Types generated for queries found in "packages/server/postgres/queries/src/insertOrgUserAuditQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type OrganizationUserAuditEventTypeEnum = 'added' | 'activated' | 'inactivated' | 'removed';

/** 'InsertOrgUserAuditQuery' parameters type */
export interface IInsertOrgUserAuditQueryParams {
  auditRows: Array<{
    orgId: string | null | void,
    userId: string | null | void,
    eventDate: Date | null | void,
    eventType: OrganizationUserAuditEventTypeEnum | null | void
  }>;
}

/** 'InsertOrgUserAuditQuery' return type */
export type IInsertOrgUserAuditQueryResult = void;

/** 'InsertOrgUserAuditQuery' query type */
export interface IInsertOrgUserAuditQueryQuery {
  params: IInsertOrgUserAuditQueryParams;
  result: IInsertOrgUserAuditQueryResult;
}

const insertOrgUserAuditQueryIR: any = {"name":"insertOrgUserAuditQuery","params":[{"name":"auditRows","codeRefs":{"defined":{"a":45,"b":53,"line":3,"col":9},"used":[{"a":204,"b":212,"line":10,"col":10}]},"transform":{"type":"pick_array_spread","keys":["orgId","userId","eventDate","eventType"]}}],"usedParamSet":{"auditRows":true},"statement":{"body":"INSERT INTO \"OrganizationUserAudit\" (\n  \"orgId\",\n  \"userId\",\n  \"eventDate\",\n  \"eventType\"\n) VALUES :auditRows","loc":{"a":104,"b":212,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "OrganizationUserAudit" (
 *   "orgId",
 *   "userId",
 *   "eventDate",
 *   "eventType"
 * ) VALUES :auditRows
 * ```
 */
export const insertOrgUserAuditQuery = new PreparedQuery<IInsertOrgUserAuditQueryParams,IInsertOrgUserAuditQueryResult>(insertOrgUserAuditQueryIR);


