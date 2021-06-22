/** Types generated for queries found in "packages/server/postgres/queries/src/updateTeamByTeamIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type MeetingTypeEnum = 'action' | 'retrospective' | 'poker'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'UpdateTeamByTeamIdQuery' parameters type */
export interface IUpdateTeamByTeamIdQueryParams {
  name: string | null | void
  isArchived: boolean | null | void
  isPaid: boolean | null | void
  jiraDimensionFields: JsonArray | null | void
  lastMeetingType: MeetingTypeEnum | null | void
  tier: TierEnum | null | void
  orgId: string | null | void
  updatedAt: Date | null | void
  id: string | null | void
}

/** 'UpdateTeamByTeamIdQuery' return type */
export interface IUpdateTeamByTeamIdQueryResult {
  id: string
  name: string
  createdAt: Date
  createdBy: string
  isArchived: boolean
  isPaid: boolean
  jiraDimensionFields: JsonArray
  lastMeetingType: MeetingTypeEnum
  tier: TierEnum
  orgId: string
  isOnboardTeam: boolean
  updatedAt: Date
}

/** 'UpdateTeamByTeamIdQuery' query type */
export interface IUpdateTeamByTeamIdQueryQuery {
  params: IUpdateTeamByTeamIdQueryParams
  result: IUpdateTeamByTeamIdQueryResult
}

const updateTeamByTeamIdQueryIR: any = {
  name: 'updateTeamByTeamIdQuery',
  params: [
    {
      name: 'name',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 77, b: 80, line: 5, col: 21}]}
    },
    {
      name: 'isArchived',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 119, b: 128, line: 6, col: 27}]}
    },
    {
      name: 'isPaid',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 169, b: 174, line: 7, col: 23}]}
    },
    {
      name: 'jiraDimensionFields',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 224, b: 242, line: 8, col: 36}]}
    },
    {
      name: 'lastMeetingType',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 301, b: 315, line: 9, col: 32}]}
    },
    {
      name: 'tier',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 359, b: 362, line: 10, col: 21}]}
    },
    {
      name: 'orgId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 396, b: 400, line: 11, col: 22}]}
    },
    {
      name: 'updatedAt',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 439, b: 447, line: 12, col: 26}]}
    },
    {
      name: 'id',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 475, b: 476, line: 13, col: 12}]}
    }
  ],
  usedParamSet: {
    name: true,
    isArchived: true,
    isPaid: true,
    jiraDimensionFields: true,
    lastMeetingType: true,
    tier: true,
    orgId: true,
    updatedAt: true,
    id: true
  },
  statement: {
    body:
      'UPDATE "Team" SET\n  "name" = COALESCE(:name, "name"),\n  "isArchived" = COALESCE(:isArchived, "isArchived"),\n  "isPaid" = COALESCE(:isPaid, "isPaid"),\n  "jiraDimensionFields" = COALESCE(:jiraDimensionFields, "jiraDimensionFields"),\n  "lastMeetingType" = COALESCE(:lastMeetingType, "lastMeetingType"),\n  "tier" = COALESCE(:tier, "tier"),\n  "orgId" = COALESCE(:orgId, "orgId"),\n  "updatedAt" = COALESCE(:updatedAt, "updatedAt")\nWHERE id = :id\nRETURNING *',
    loc: {a: 38, b: 488, line: 4, col: 0}
  }
}

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
 * WHERE id = :id
 * RETURNING *
 * ```
 */
export const updateTeamByTeamIdQuery = new PreparedQuery<
  IUpdateTeamByTeamIdQueryParams,
  IUpdateTeamByTeamIdQueryResult
>(updateTeamByTeamIdQueryIR)
