/** Types generated for queries found in "packages/server/postgres/queries/src/insertUserQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type stringArray = string[]

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'InsertUserQuery' parameters type */
export interface IInsertUserQueryParams {
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
}

/** 'InsertUserQuery' return type */
export type IInsertUserQueryResult = void

/** 'InsertUserQuery' query type */
export interface IInsertUserQueryQuery {
  params: IInsertUserQueryParams
  result: IInsertUserQueryResult
}

const insertUserQueryIR: any = {
  name: 'insertUserQuery',
  params: [
    {
      name: 'id',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 249, b: 250, line: 19, col: 3}]}
    },
    {
      name: 'email',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 256, b: 260, line: 20, col: 3}]}
    },
    {
      name: 'createdAt',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 266, b: 274, line: 21, col: 3}]}
    },
    {
      name: 'updatedAt',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 280, b: 288, line: 22, col: 3}]}
    },
    {
      name: 'inactive',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 294, b: 301, line: 23, col: 3}]}
    },
    {
      name: 'lastSeenAt',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 307, b: 316, line: 24, col: 3}]}
    },
    {
      name: 'preferredName',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 322, b: 334, line: 25, col: 3}]}
    },
    {
      name: 'tier',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 340, b: 343, line: 26, col: 3}]}
    },
    {
      name: 'picture',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 349, b: 355, line: 27, col: 3}]}
    },
    {
      name: 'tms',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 361, b: 363, line: 28, col: 3}]}
    },
    {
      name: 'featureFlags',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 369, b: 380, line: 29, col: 3}]}
    },
    {
      name: 'lastSeenAtURLs',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 386, b: 399, line: 30, col: 3}]}
    },
    {
      name: 'identities',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 405, b: 414, line: 31, col: 3}]}
    }
  ],
  usedParamSet: {
    id: true,
    email: true,
    createdAt: true,
    updatedAt: true,
    inactive: true,
    lastSeenAt: true,
    preferredName: true,
    tier: true,
    picture: true,
    tms: true,
    featureFlags: true,
    lastSeenAtURLs: true,
    identities: true
  },
  statement: {
    body:
      'INSERT INTO "User" (\n  "id",\n  "email",\n  "createdAt", \n  "updatedAt",\n  "inactive",\n  "lastSeenAt",\n  "preferredName",\n  "tier",\n  "picture",\n  "tms",\n  "featureFlags",\n  "lastSeenAtURLs",\n  "identities"\n) VALUES (\n  :id,\n  :email,\n  :createdAt,\n  :updatedAt,\n  :inactive,\n  :lastSeenAt,\n  :preferredName,\n  :tier,\n  :picture,\n  :tms,\n  :featureFlags,\n  :lastSeenAtURLs,\n  :identities\n)',
    loc: {a: 30, b: 416, line: 4, col: 0}
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
 *   "lastSeenAtURLs",
 *   "identities"
 * ) VALUES (
 *   :id,
 *   :email,
 *   :createdAt,
 *   :updatedAt,
 *   :inactive,
 *   :lastSeenAt,
 *   :preferredName,
 *   :tier,
 *   :picture,
 *   :tms,
 *   :featureFlags,
 *   :lastSeenAtURLs,
 *   :identities
 * )
 * ```
 */
export const insertUserQuery = new PreparedQuery<IInsertUserQueryParams, IInsertUserQueryResult>(
  insertUserQueryIR
)
