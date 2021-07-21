/** Types generated for queries found in "packages/server/postgres/queries/src/getTeamsByOrgIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type MeetingTypeEnum = 'action' | 'retrospective' | 'poker'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'GetTeamsByOrgIdQuery' parameters type */
export interface IGetTeamsByOrgIdQueryParams {
  orgIds: Array<string | null | void>
}

/** 'GetTeamsByOrgIdQuery' return type */
export interface IGetTeamsByOrgIdQueryResult {
  id: string
  name: string
  createdAt: Date
  createdBy: string | null
  isArchived: boolean
  isPaid: boolean
  jiraDimensionFields: JsonArray
  lastMeetingType: MeetingTypeEnum
  tier: TierEnum
  orgId: string
  isOnboardTeam: boolean
  updatedAt: Date
  lockMessageHTML: string | null
}

/** 'GetTeamsByOrgIdQuery' query type */
export interface IGetTeamsByOrgIdQueryQuery {
  params: IGetTeamsByOrgIdQueryParams
  result: IGetTeamsByOrgIdQueryResult
}

const getTeamsByOrgIdQueryIR: any = {
  name: 'getTeamsByOrgIdQuery',
  params: [
    {
      name: 'orgIds',
      codeRefs: {
        defined: {a: 41, b: 46, line: 3, col: 9},
        used: [{a: 99, b: 104, line: 6, col: 18}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {orgIds: true},
  statement: {
    body: 'SELECT * FROM "Team"\nWHERE "orgId" IN :orgIds',
    loc: {a: 60, b: 104, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "Team"
 * WHERE "orgId" IN :orgIds
 * ```
 */
export const getTeamsByOrgIdQuery = new PreparedQuery<
  IGetTeamsByOrgIdQueryParams,
  IGetTeamsByOrgIdQueryResult
>(getTeamsByOrgIdQueryIR)
