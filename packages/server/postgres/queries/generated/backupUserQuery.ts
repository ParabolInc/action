/** Types generated for queries found in "packages/server/postgres/queries/src/backupUserQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type AuthTokenRole = 'su'

export type stringArray = string[]

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'BackupUserQuery' parameters type */
export interface IBackupUserQueryParams {
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
    lastSeenAtURLs: stringArray | null | void
    identities: JsonArray | null | void
    segmentId: string | null | void
    newFeatureId: string | null | void
    overLimitCopy: string | null | void
    isRemoved: boolean | null | void
    reasonRemoved: string | null | void
    rol: AuthTokenRole | null | void
    payLaterClickCount: number | null | void
  }>
}

/** 'BackupUserQuery' return type */
export type IBackupUserQueryResult = void

/** 'BackupUserQuery' query type */
export interface IBackupUserQueryQuery {
  params: IBackupUserQueryParams
  result: IBackupUserQueryResult
}

const backupUserQueryIR: any = {
  name: 'backupUserQuery',
  params: [
    {
      name: 'users',
      codeRefs: {
        defined: {a: 36, b: 40, line: 3, col: 9},
        used: [{a: 740, b: 744, line: 47, col: 12}]
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
          'lastSeenAtURLs',
          'identities',
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
      'INSERT INTO "User" ( \n    "id",\n    "email",\n    "createdAt", \n    "updatedAt",\n    "inactive",\n    "lastSeenAt",\n    "preferredName",\n    "tier",\n    "picture",\n    "tms",\n    "featureFlags",\n    "lastSeenAtURLs",\n    "identities",\n    "segmentId",\n    "newFeatureId",\n    "overLimitCopy",\n    "isRemoved",\n    "reasonRemoved",\n    "rol",\n    "payLaterClickCount"\n  ) VALUES :users\n  ON CONFLICT (id) DO UPDATE SET\n    email = EXCLUDED."email",\n    "createdAt" = EXCLUDED."createdAt",\n    "updatedAt" = EXCLUDED."updatedAt",\n    inactive = EXCLUDED."inactive",\n    "lastSeenAt" = EXCLUDED."lastSeenAt",\n    "preferredName" = EXCLUDED."preferredName",\n    tier = EXCLUDED."tier",\n    picture = EXCLUDED."picture",\n    tms = EXCLUDED."tms",\n    "featureFlags" = EXCLUDED."featureFlags",\n    "lastSeenAtURLs" = EXCLUDED."lastSeenAtURLs",\n    identities = EXCLUDED."identities",\n    "segmentId" = EXCLUDED."segmentId",\n    "newFeatureId" = EXCLUDED."newFeatureId",\n    "overLimitCopy" = EXCLUDED."overLimitCopy",\n    "isRemoved" = EXCLUDED."isRemoved",\n    "reasonRemoved" = EXCLUDED."reasonRemoved",\n    rol = EXCLUDED."rol",\n    "payLaterClickCount" = EXCLUDED."payLaterClickCount"',
    loc: {a: 363, b: 1542, line: 26, col: 2}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "User" (
 *     "id",
 *     "email",
 *     "createdAt",
 *     "updatedAt",
 *     "inactive",
 *     "lastSeenAt",
 *     "preferredName",
 *     "tier",
 *     "picture",
 *     "tms",
 *     "featureFlags",
 *     "lastSeenAtURLs",
 *     "identities",
 *     "segmentId",
 *     "newFeatureId",
 *     "overLimitCopy",
 *     "isRemoved",
 *     "reasonRemoved",
 *     "rol",
 *     "payLaterClickCount"
 *   ) VALUES :users
 *   ON CONFLICT (id) DO UPDATE SET
 *     email = EXCLUDED."email",
 *     "createdAt" = EXCLUDED."createdAt",
 *     "updatedAt" = EXCLUDED."updatedAt",
 *     inactive = EXCLUDED."inactive",
 *     "lastSeenAt" = EXCLUDED."lastSeenAt",
 *     "preferredName" = EXCLUDED."preferredName",
 *     tier = EXCLUDED."tier",
 *     picture = EXCLUDED."picture",
 *     tms = EXCLUDED."tms",
 *     "featureFlags" = EXCLUDED."featureFlags",
 *     "lastSeenAtURLs" = EXCLUDED."lastSeenAtURLs",
 *     identities = EXCLUDED."identities",
 *     "segmentId" = EXCLUDED."segmentId",
 *     "newFeatureId" = EXCLUDED."newFeatureId",
 *     "overLimitCopy" = EXCLUDED."overLimitCopy",
 *     "isRemoved" = EXCLUDED."isRemoved",
 *     "reasonRemoved" = EXCLUDED."reasonRemoved",
 *     rol = EXCLUDED."rol",
 *     "payLaterClickCount" = EXCLUDED."payLaterClickCount"
 * ```
 */
export const backupUserQuery = new PreparedQuery<IBackupUserQueryParams, IBackupUserQueryResult>(
  backupUserQueryIR
)
