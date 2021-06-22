/** Types generated for queries found in "packages/server/postgres/queries/src/getTeamByTeamIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type MeetingTypeEnum = 'action' | 'retrospective' | 'poker'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'GetTeamByTeamIdQuery' parameters type */
export interface IGetTeamByTeamIdQueryParams {
  id: string | null | void
}

/** 'GetTeamByTeamIdQuery' return type */
export interface IGetTeamByTeamIdQueryResult {
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

/** 'GetTeamByTeamIdQuery' query type */
export interface IGetTeamByTeamIdQueryQuery {
  params: IGetTeamByTeamIdQueryParams
  result: IGetTeamByTeamIdQueryResult
}

const getTeamByTeamIdQueryIR: any = {
  name: 'getTeamByTeamIdQuery',
  params: [
    {name: 'id', transform: {type: 'scalar'}, codeRefs: {used: [{a: 68, b: 69, line: 5, col: 12}]}}
  ],
  usedParamSet: {id: true},
  statement: {body: 'SELECT * FROM "Team"\nWHERE id = :id', loc: {a: 35, b: 69, line: 4, col: 0}}
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "Team"
 * WHERE id = :id
 * ```
 */
export const getTeamByTeamIdQuery = new PreparedQuery<
  IGetTeamByTeamIdQueryParams,
  IGetTeamByTeamIdQueryResult
>(getTeamByTeamIdQueryIR)
