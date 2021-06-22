/** Types generated for queries found in "packages/server/postgres/queries/src/getTeamsByIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type MeetingTypeEnum = 'action' | 'retrospective' | 'poker'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'GetTeamsByIdQuery' parameters type */
export interface IGetTeamsByIdQueryParams {
  ids: Array<string | null | void>
}

/** 'GetTeamsByIdQuery' return type */
export interface IGetTeamsByIdQueryResult {
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
}

/** 'GetTeamsByIdQuery' query type */
export interface IGetTeamsByIdQueryQuery {
  params: IGetTeamsByIdQueryParams
  result: IGetTeamsByIdQueryResult
}

const getTeamsByIdQueryIR: any = {
  name: 'getTeamsByIdQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 38, b: 40, line: 3, col: 9},
        used: [{a: 88, b: 90, line: 6, col: 13}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {ids: true},
  statement: {body: 'SELECT * FROM "Team"\nWHERE id IN :ids', loc: {a: 54, b: 90, line: 5, col: 0}}
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "Team"
 * WHERE id IN :ids
 * ```
 */
export const getTeamsByIdQuery = new PreparedQuery<
  IGetTeamsByIdQueryParams,
  IGetTeamsByIdQueryResult
>(getTeamsByIdQueryIR)
