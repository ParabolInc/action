/** Types generated for queries found in "packages/server/postgres/queries/src/insertUserWithAllColumnsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type AuthTokenRole = 'su'

export type stringArray = string[]

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'InsertUserWithAllColumnsQuery' parameters type */
export interface IInsertUserWithAllColumnsQueryParams {
  users: Array<{
    id: string | null | void
    email: string | null | void
    createdAt: Date | null | void
    updatedAt: Date | null | void
    inactive: boolean | null | void
    lastSeenAt: Date | null | void
    preferredName: string | null | void
    tier: TierEnum | null | void
    picture: string | null | void
    tms: stringArray | null | void
    featureFlags: stringArray | null | void
    identities: JsonArray | null | void
    lastSeenAtURLs: stringArray | null | void
    segmentId: string | null | void
    newFeatureId: string | null | void
    overLimitCopy: string | null | void
    isRemoved: boolean | null | void
    reasonRemoved: string | null | void
    rol: AuthTokenRole | null | void
    payLaterClickCount: number | null | void
  }>
}

/** 'InsertUserWithAllColumnsQuery' return type */
export type IInsertUserWithAllColumnsQueryResult = void

/** 'InsertUserWithAllColumnsQuery' query type */
export interface IInsertUserWithAllColumnsQueryQuery {
  params: IInsertUserWithAllColumnsQueryParams
  result: IInsertUserWithAllColumnsQueryResult
}

const insertUserWithAllColumnsQueryIR: any = {
  name: 'insertUserWithAllColumnsQuery',
  params: [
    {
      name: 'users',
      codeRefs: {
        defined: {a: 51, b: 55, line: 4, col: 9},
        used: [{a: 710, b: 714, line: 48, col: 10}]
      },
      transform: {
        type: 'pick_array_spread',
        keys: [
          'id',
          'email',
          'createdAt',
          'updatedAt',
          'inactive',
          'lastSeenAt',
          'preferredName',
          'tier',
          'picture',
          'tms',
          'featureFlags',
          'identities',
          'lastSeenAtURLs',
          'segmentId',
          'newFeatureId',
          'overLimitCopy',
          'isRemoved',
          'reasonRemoved',
          'rol',
          'payLaterClickCount'
        ]
      }
    }
  ],
  usedParamSet: {users: true},
  statement: {
    body:
      'INSERT INTO "User" (\n  "id",\n  "email",\n  "createdAt", \n  "updatedAt",\n  "inactive",\n  "lastSeenAt",\n  "preferredName",\n  "tier",\n  "picture",\n  "tms",\n  "featureFlags",\n  "identities",\n  "lastSeenAtURLs",\n  "segmentId",\n  "newFeatureId",\n  "overLimitCopy",\n  "isRemoved",\n  "reasonRemoved",\n  "rol",\n  "payLaterClickCount"\n) VALUES :users',
    loc: {a: 376, b: 714, line: 27, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "User" (
 *   "id",
 *   "email",
 *   "createdAt",
 *   "updatedAt",
 *   "inactive",
 *   "lastSeenAt",
 *   "preferredName",
 *   "tier",
 *   "picture",
 *   "tms",
 *   "featureFlags",
 *   "identities",
 *   "lastSeenAtURLs",
 *   "segmentId",
 *   "newFeatureId",
 *   "overLimitCopy",
 *   "isRemoved",
 *   "reasonRemoved",
 *   "rol",
 *   "payLaterClickCount"
 * ) VALUES :users
 * ```
 */
export const insertUserWithAllColumnsQuery = new PreparedQuery<
  IInsertUserWithAllColumnsQueryParams,
  IInsertUserWithAllColumnsQueryResult
>(insertUserWithAllColumnsQueryIR)
