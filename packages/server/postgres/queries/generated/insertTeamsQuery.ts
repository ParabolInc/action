/** Types generated for queries found in "packages/server/postgres/queries/src/insertTeamsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type MeetingTypeEnum = 'action' | 'retrospective' | 'poker'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'InsertTeamsQuery' parameters type */
export interface IInsertTeamsQueryParams {
  teams: Array<{
    id: string | null | void
    name: string | null | void
    createdAt: Date | null | void
    createdBy: string | null | void
    isArchived: boolean | null | void
    isPaid: boolean | null | void
    jiraDimensionFields: JsonArray | null | void
    lastMeetingType: MeetingTypeEnum | null | void
    tier: TierEnum | null | void
    orgId: string | null | void
    isOnboardTeam: boolean | null | void
    updatedAt: Date | null | void
    lockMessageHTML: string | null | void
  }>
}

/** 'InsertTeamsQuery' return type */
export type IInsertTeamsQueryResult = void

/** 'InsertTeamsQuery' query type */
export interface IInsertTeamsQueryQuery {
  params: IInsertTeamsQueryParams
  result: IInsertTeamsQueryResult
}

const insertTeamsQueryIR: any = {
  name: 'insertTeamsQuery',
  params: [
    {
      name: 'teams',
      codeRefs: {
        defined: {a: 37, b: 41, line: 3, col: 9},
        used: [{a: 485, b: 489, line: 33, col: 10}]
      },
      transform: {
        type: 'pick_array_spread',
        keys: [
          'id',
          'name',
          'createdAt',
          'createdBy',
          'isArchived',
          'isPaid',
          'jiraDimensionFields',
          'lastMeetingType',
          'tier',
          'orgId',
          'isOnboardTeam',
          'updatedAt',
          'lockMessageHTML'
        ]
      }
    }
  ],
  usedParamSet: {teams: true},
  statement: {
    body:
      'INSERT INTO "Team" (\n  "id",\n  "name",\n  "createdAt",\n  "createdBy",\n  "isArchived",\n  "isPaid",\n  "jiraDimensionFields",\n  "lastMeetingType",\n  "tier",\n  "orgId",\n  "isOnboardTeam",\n  "updatedAt",\n  "lockMessageHTML"\n) VALUES :teams',
    loc: {a: 257, b: 489, line: 19, col: 0}
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
 *   "jiraDimensionFields",
 *   "lastMeetingType",
 *   "tier",
 *   "orgId",
 *   "isOnboardTeam",
 *   "updatedAt",
 *   "lockMessageHTML"
 * ) VALUES :teams
 * ```
 */
export const insertTeamsQuery = new PreparedQuery<IInsertTeamsQueryParams, IInsertTeamsQueryResult>(
  insertTeamsQueryIR
)
