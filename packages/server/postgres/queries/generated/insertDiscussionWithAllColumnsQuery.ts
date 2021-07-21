/** Types generated for queries found in "packages/server/postgres/queries/src/insertDiscussionWithAllColumnsQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type DiscussionTopicTypeEnum =
  | 'agendaItem'
  | 'reflectionGroup'
  | 'task'
  | 'githubIssue'
  | 'jiraIssue'

/** 'InsertDiscussionWithAllColumnsQuery' parameters type */
export interface IInsertDiscussionWithAllColumnsQueryParams {
  discussions: Array<{
    id: string | null | void
    createdAt: Date | null | void
    teamId: string | null | void
    meetingId: string | null | void
    discussionTopicId: string | null | void
    discussionTopicType: DiscussionTopicTypeEnum | null | void
  }>
}

/** 'InsertDiscussionWithAllColumnsQuery' return type */
export type IInsertDiscussionWithAllColumnsQueryResult = void

/** 'InsertDiscussionWithAllColumnsQuery' query type */
export interface IInsertDiscussionWithAllColumnsQueryQuery {
  params: IInsertDiscussionWithAllColumnsQueryParams
  result: IInsertDiscussionWithAllColumnsQueryResult
}

const insertDiscussionWithAllColumnsQueryIR: any = {
  name: 'insertDiscussionWithAllColumnsQuery',
  params: [
    {
      name: 'discussions',
      codeRefs: {
        defined: {a: 56, b: 66, line: 3, col: 9},
        used: [{a: 316, b: 326, line: 20, col: 8}]
      },
      transform: {
        type: 'pick_array_spread',
        keys: ['id', 'createdAt', 'teamId', 'meetingId', 'discussionTopicId', 'discussionTopicType']
      }
    }
  ],
  usedParamSet: {discussions: true},
  statement: {
    body:
      'INSERT INTO "Discussion" (\n  "id",\n  "createdAt",\n  "teamId",\n  "meetingId",\n  "discussionTopicId",\n  "discussionTopicType"\n)\nVALUES :discussions',
    loc: {a: 182, b: 326, line: 12, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "Discussion" (
 *   "id",
 *   "createdAt",
 *   "teamId",
 *   "meetingId",
 *   "discussionTopicId",
 *   "discussionTopicType"
 * )
 * VALUES :discussions
 * ```
 */
export const insertDiscussionWithAllColumnsQuery = new PreparedQuery<
  IInsertDiscussionWithAllColumnsQueryParams,
  IInsertDiscussionWithAllColumnsQueryResult
>(insertDiscussionWithAllColumnsQueryIR)
