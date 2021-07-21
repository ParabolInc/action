/** Types generated for queries found in "packages/server/postgres/queries/src/getOrgUserAuditByOrgIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type OrganizationUserAuditEventTypeEnum = 'added' | 'activated' | 'inactivated' | 'removed'

/** 'GetOrgUserAuditByOrgIdQuery' parameters type */
export interface IGetOrgUserAuditByOrgIdQueryParams {
  orgIds: Array<string | null | void>
}

/** 'GetOrgUserAuditByOrgIdQuery' return type */
export interface IGetOrgUserAuditByOrgIdQueryResult {
  id: number
  orgId: string
  userId: string
  eventDate: Date
  eventType: OrganizationUserAuditEventTypeEnum
}

/** 'GetOrgUserAuditByOrgIdQuery' query type */
export interface IGetOrgUserAuditByOrgIdQueryQuery {
  params: IGetOrgUserAuditByOrgIdQueryParams
  result: IGetOrgUserAuditByOrgIdQueryResult
}

const getOrgUserAuditByOrgIdQueryIR: any = {
  name: 'getOrgUserAuditByOrgIdQuery',
  params: [
    {
      name: 'orgIds',
      codeRefs: {
        defined: {a: 48, b: 53, line: 3, col: 9},
        used: [{a: 123, b: 128, line: 6, col: 18}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {orgIds: true},
  statement: {
    body: 'SELECT * FROM "OrganizationUserAudit"\nWHERE "orgId" in :orgIds',
    loc: {a: 67, b: 128, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "OrganizationUserAudit"
 * WHERE "orgId" in :orgIds
 * ```
 */
export const getOrgUserAuditByOrgIdQuery = new PreparedQuery<
  IGetOrgUserAuditByOrgIdQueryParams,
  IGetOrgUserAuditByOrgIdQueryResult
>(getOrgUserAuditByOrgIdQueryIR)
