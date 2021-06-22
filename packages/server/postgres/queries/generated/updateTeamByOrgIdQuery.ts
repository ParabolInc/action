/** Types generated for queries found in "packages/server/postgres/queries/src/updateTeamByOrgIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type MeetingTypeEnum = 'action' | 'retrospective' | 'poker'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'UpdateTeamByOrgIdQuery' parameters type */
export interface IUpdateTeamByOrgIdQueryParams {
  name: string | null | void
  isArchived: boolean | null | void
  isPaid: boolean | null | void
  jiraDimensionFields: JsonArray | null | void
  lastMeetingType: MeetingTypeEnum | null | void
  tier: TierEnum | null | void
  orgId: string | null | void
  updatedAt: Date | null | void
}

/** 'UpdateTeamByOrgIdQuery' return type */
export interface IUpdateTeamByOrgIdQueryResult {
  id: string;
}

/** 'UpdateTeamByOrgIdQuery' query type */
export interface IUpdateTeamByOrgIdQueryQuery {
  params: IUpdateTeamByOrgIdQueryParams
  result: IUpdateTeamByOrgIdQueryResult
}

const updateTeamByOrgIdQueryIR: any = {"name":"updateTeamByOrgIdQuery","params":[{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":76,"b":79,"line":5,"col":21}]}},{"name":"isArchived","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":118,"b":127,"line":6,"col":27}]}},{"name":"isPaid","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":168,"b":173,"line":7,"col":23}]}},{"name":"jiraDimensionFields","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":223,"b":241,"line":8,"col":36}]}},{"name":"lastMeetingType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":300,"b":314,"line":9,"col":32}]}},{"name":"tier","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":358,"b":361,"line":10,"col":21}]}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":395,"b":399,"line":11,"col":22},{"a":479,"b":483,"line":13,"col":17}]}},{"name":"updatedAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":438,"b":446,"line":12,"col":26}]}}],"usedParamSet":{"name":true,"isArchived":true,"isPaid":true,"jiraDimensionFields":true,"lastMeetingType":true,"tier":true,"orgId":true,"updatedAt":true},"statement":{"body":"UPDATE \"Team\" SET\n  \"name\" = COALESCE(:name, \"name\"),\n  \"isArchived\" = COALESCE(:isArchived, \"isArchived\"),\n  \"isPaid\" = COALESCE(:isPaid, \"isPaid\"),\n  \"jiraDimensionFields\" = COALESCE(:jiraDimensionFields, \"jiraDimensionFields\"),\n  \"lastMeetingType\" = COALESCE(:lastMeetingType, \"lastMeetingType\"),\n  \"tier\" = COALESCE(:tier, \"tier\"),\n  \"orgId\" = COALESCE(:orgId, \"orgId\"),\n  \"updatedAt\" = COALESCE(:updatedAt, \"updatedAt\")\nWHERE \"orgId\" = :orgId\nRETURNING \"id\"","loc":{"a":37,"b":498,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "Team" SET
 *   "name" = COALESCE(:name, "name"),
 *   "isArchived" = COALESCE(:isArchived, "isArchived"),
 *   "isPaid" = COALESCE(:isPaid, "isPaid"),
 *   "jiraDimensionFields" = COALESCE(:jiraDimensionFields, "jiraDimensionFields"),
 *   "lastMeetingType" = COALESCE(:lastMeetingType, "lastMeetingType"),
 *   "tier" = COALESCE(:tier, "tier"),
 *   "orgId" = COALESCE(:orgId, "orgId"),
 *   "updatedAt" = COALESCE(:updatedAt, "updatedAt")
 * WHERE "orgId" = :orgId
 * RETURNING "id"
 * ```
 */
export const updateTeamByOrgIdQuery = new PreparedQuery<
  IUpdateTeamByOrgIdQueryParams,
  IUpdateTeamByOrgIdQueryResult
>(updateTeamByOrgIdQueryIR)
