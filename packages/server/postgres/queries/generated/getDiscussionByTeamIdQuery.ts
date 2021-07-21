/** Types generated for queries found in "packages/server/postgres/queries/src/getDiscussionByTeamIdQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type DiscussionTopicTypeEnum =
  | 'agendaItem'
  | 'reflectionGroup'
  | 'task'
  | 'githubIssue'
  | 'jiraIssue'

/** 'GetDiscussionByTeamIdQuery' parameters type */
export interface IGetDiscussionByTeamIdQueryParams {
  teamIds: Array<string | null | void>
}

/** 'GetDiscussionByTeamIdQuery' return type */
export interface IGetDiscussionByTeamIdQueryResult {
  id: string
  createdAt: Date
  teamId: string
  meetingId: string
  discussionTopicId: string
  discussionTopicType: DiscussionTopicTypeEnum
}

/** 'GetDiscussionByTeamIdQuery' query type */
export interface IGetDiscussionByTeamIdQueryQuery {
  params: IGetDiscussionByTeamIdQueryParams
  result: IGetDiscussionByTeamIdQueryResult
}

const getDiscussionByTeamIdQueryIR: any = {
  name: 'getDiscussionByTeamIdQuery',
  params: [
    {
      name: 'teamIds',
      codeRefs: {
        defined: {a: 47, b: 53, line: 3, col: 9},
        used: [{a: 113, b: 119, line: 6, col: 19}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {teamIds: true},
  statement: {
    body: 'SELECT * FROM "Discussion"\nWHERE "teamId" IN :teamIds',
    loc: {a: 67, b: 119, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "Discussion"
 * WHERE "teamId" IN :teamIds
 * ```
 */
export const getDiscussionByTeamIdQuery = new PreparedQuery<
  IGetDiscussionByTeamIdQueryParams,
  IGetDiscussionByTeamIdQueryResult
>(getDiscussionByTeamIdQueryIR)
