/** Types generated for queries found in "packages/server/postgres/queries/src/backupTeamQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type MeetingTypeEnum = 'action' | 'retrospective' | 'poker'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'BackupTeamQuery' parameters type */
export interface IBackupTeamQueryParams {
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
  }>
}

/** 'BackupTeamQuery' return type */
export type IBackupTeamQueryResult = void

/** 'BackupTeamQuery' query type */
export interface IBackupTeamQueryQuery {
  params: IBackupTeamQueryParams
  result: IBackupTeamQueryResult
}

const backupTeamQueryIR: any = {
  name: 'backupTeamQuery',
  params: [
    {
      name: 'teams',
      codeRefs: {
        defined: {a: 36, b: 40, line: 3, col: 9},
        used: [{a: 466, b: 470, line: 31, col: 10}]
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
          'updatedAt'
        ]
      }
    }
  ],
  usedParamSet: {teams: true},
  statement: {
    body:
      'INSERT INTO "Team" (\n    "id",\n    "name",\n    "createdAt",\n    "createdBy",\n    "isArchived",\n    "isPaid",\n    "jiraDimensionFields",\n    "lastMeetingType",\n    "tier",\n    "orgId",\n    "isOnboardTeam",\n    "updatedAt"\n) VALUES :teams\nON CONFLICT (id) DO UPDATE SET\n  "id" = EXCLUDED."id",\n  "name" = EXCLUDED."name",\n  "createdAt" = EXCLUDED."createdAt",\n  "createdBy" = EXCLUDED."createdBy",\n  "isArchived" = EXCLUDED."isArchived",\n  "isPaid" = EXCLUDED."isPaid",\n  "jiraDimensionFields" = EXCLUDED."jiraDimensionFields",\n  "lastMeetingType" = EXCLUDED."lastMeetingType",\n  "tier" = EXCLUDED."tier",\n  "orgId" = EXCLUDED."orgId",\n  "isOnboardTeam" = EXCLUDED."isOnboardTeam",\n  "updatedAt" = EXCLUDED."updatedAt"',
    loc: {a: 235, b: 950, line: 18, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "Team" (
 *     "id",
 *     "name",
 *     "createdAt",
 *     "createdBy",
 *     "isArchived",
 *     "isPaid",
 *     "jiraDimensionFields",
 *     "lastMeetingType",
 *     "tier",
 *     "orgId",
 *     "isOnboardTeam",
 *     "updatedAt"
 * ) VALUES :teams
 * ON CONFLICT (id) DO UPDATE SET
 *   "id" = EXCLUDED."id",
 *   "name" = EXCLUDED."name",
 *   "createdAt" = EXCLUDED."createdAt",
 *   "createdBy" = EXCLUDED."createdBy",
 *   "isArchived" = EXCLUDED."isArchived",
 *   "isPaid" = EXCLUDED."isPaid",
 *   "jiraDimensionFields" = EXCLUDED."jiraDimensionFields",
 *   "lastMeetingType" = EXCLUDED."lastMeetingType",
 *   "tier" = EXCLUDED."tier",
 *   "orgId" = EXCLUDED."orgId",
 *   "isOnboardTeam" = EXCLUDED."isOnboardTeam",
 *   "updatedAt" = EXCLUDED."updatedAt"
 * ```
 */
export const backupTeamQuery = new PreparedQuery<IBackupTeamQueryParams, IBackupTeamQueryResult>(
  backupTeamQueryIR
)
