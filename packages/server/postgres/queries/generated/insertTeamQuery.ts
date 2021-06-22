/** Types generated for queries found in "packages/server/postgres/queries/src/insertTeamQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type MeetingTypeEnum = 'action' | 'retrospective' | 'poker'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

/** 'InsertTeamQuery' parameters type */
export interface IInsertTeamQueryParams {
  id: string | null | void
  name: string | null | void
  createdAt: Date | null | void
  createdBy: string | null | void
  isArchived: boolean | null | void
  isPaid: boolean | null | void
  lastMeetingType: MeetingTypeEnum | null | void
  tier: TierEnum | null | void
  orgId: string | null | void
  isOnboardTeam: boolean | null | void
  updatedAt: Date | null | void
}

/** 'InsertTeamQuery' return type */
export type IInsertTeamQueryResult = void

/** 'InsertTeamQuery' query type */
export interface IInsertTeamQueryQuery {
  params: IInsertTeamQueryParams
  result: IInsertTeamQueryResult
}

const insertTeamQueryIR: any = {
  name: 'insertTeamQuery',
  params: [
    {
      name: 'id',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 216, b: 217, line: 17, col: 3}]}
    },
    {
      name: 'name',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 223, b: 226, line: 18, col: 3}]}
    },
    {
      name: 'createdAt',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 232, b: 240, line: 19, col: 3}]}
    },
    {
      name: 'createdBy',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 246, b: 254, line: 20, col: 3}]}
    },
    {
      name: 'isArchived',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 260, b: 269, line: 21, col: 3}]}
    },
    {
      name: 'isPaid',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 275, b: 280, line: 22, col: 3}]}
    },
    {
      name: 'lastMeetingType',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 286, b: 300, line: 23, col: 3}]}
    },
    {
      name: 'tier',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 306, b: 309, line: 24, col: 3}]}
    },
    {
      name: 'orgId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 315, b: 319, line: 25, col: 3}]}
    },
    {
      name: 'isOnboardTeam',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 325, b: 337, line: 26, col: 3}]}
    },
    {
      name: 'updatedAt',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 343, b: 351, line: 27, col: 3}]}
    }
  ],
  usedParamSet: {
    id: true,
    name: true,
    createdAt: true,
    createdBy: true,
    isArchived: true,
    isPaid: true,
    lastMeetingType: true,
    tier: true,
    orgId: true,
    isOnboardTeam: true,
    updatedAt: true
  },
  statement: {
    body:
      'INSERT INTO "Team" (\n  "id",\n  "name",\n  "createdAt",\n  "createdBy",\n  "isArchived",\n  "isPaid",\n  "lastMeetingType",\n  "tier",\n  "orgId",\n  "isOnboardTeam",\n  "updatedAt"\n) VALUES (\n  :id,\n  :name,\n  :createdAt,\n  :createdBy,\n  :isArchived,\n  :isPaid,\n  :lastMeetingType,\n  :tier,\n  :orgId,\n  :isOnboardTeam,\n  :updatedAt\n)',
    loc: {a: 30, b: 353, line: 4, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "Team" (
 *   "id",
 *   "name",
 *   "createdAt",
 *   "createdBy",
 *   "isArchived",
 *   "isPaid",
 *   "lastMeetingType",
 *   "tier",
 *   "orgId",
 *   "isOnboardTeam",
 *   "updatedAt"
 * ) VALUES (
 *   :id,
 *   :name,
 *   :createdAt,
 *   :createdBy,
 *   :isArchived,
 *   :isPaid,
 *   :lastMeetingType,
 *   :tier,
 *   :orgId,
 *   :isOnboardTeam,
 *   :updatedAt
 * )
 * ```
 */
export const insertTeamQuery = new PreparedQuery<IInsertTeamQueryParams, IInsertTeamQueryResult>(
  insertTeamQueryIR
)
