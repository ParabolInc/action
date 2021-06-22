import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import promiseAllPartial from 'parabol-client/utils/promiseAllPartial'
import {JiraGetIssueRes} from '../../client/utils/AtlassianManager'
import getRethink, {RethinkSchema} from '../database/rethinkDriver'
import AtlassianAuth from '../database/types/AtlassianAuth'
import {MeetingTypeEnum} from '../database/types/Meeting'
import MeetingTemplate from '../database/types/MeetingTemplate'
import {Reactable, ReactableEnum} from '../database/types/Reactable'
import Task, {TaskStatusEnum} from '../database/types/Task'
import {ThreadSource, ThreadSourceEnum} from '../database/types/ThreadSource'
import getGitHubAuthByUserIdTeamId, {
  GetGitHubAuthByUserIdTeamIdResult
} from '../postgres/queries/getGitHubAuthByUserIdTeamId'
import getTeamsById, {IGetTeamsByIdResult} from '../postgres/queries/getTeamsById'
import catchAndLog from '../postgres/utils/catchAndLog'
import AtlassianServerManager from '../utils/AtlassianServerManager'
import sendToSentry from '../utils/sendToSentry'
import normalizeRethinkDbResults from './normalizeRethinkDbResults'
import ProxiedCache from './ProxiedCache'
import RethinkDataLoader from './RethinkDataLoader'

type TeamUserKey = {teamId: string; userId: string}
export interface JiraRemoteProjectKey {
  accessToken: string
  cloudId: string
  atlassianProjectId: string
}

export interface JiraIssueKey {
  teamId: string
  userId: string
  cloudId: string
  issueKey: string
}

export interface UserTasksKey {
  first: number
  after: number | string
  userIds: string[] | null
  teamIds: string[]
  archived: boolean
  includeUnassigned: boolean
  statusFilters?: TaskStatusEnum[]
  filterQuery?: string
}

export interface ReactablesKey {
  id: string
  type: ReactableEnum
}

export interface ThreadSourceKey {
  sourceId: string
  type: ThreadSourceEnum
}

export interface MeetingSettingsKey {
  teamId: string
  meetingType: MeetingTypeEnum
}

export interface MeetingTemplateKey {
  teamId: string
  meetingType: MeetingTypeEnum
}

const reactableLoaders = [
  {type: 'COMMENT', loader: 'comments'},
  {type: 'REFLECTION', loader: 'retroReflections'}
] as const

const threadableLoaders = [
  {type: 'AGENDA_ITEM', loader: 'agendaItems'},
  {type: 'REFLECTION_GROUP', loader: 'retroReflectionGroups'}
] as const

// export type LoaderMakerCustom<K, V, C = K> = (parent: RethinkDataLoader) => DataLoader<K, V, C>

// TODO: refactor if the interface pattern is used a total of 3 times

export const users = () => {
  return new ProxiedCache('User')
}

export const teams = (parent: RethinkDataLoader) =>
  new DataLoader<string, IGetTeamsByIdResult, string>(
    async (teamIds) => {
      const teams = (await catchAndLog(() =>
        getTeamsById(teamIds as string[])
      )) as IGetTeamsByIdResult[]
      return normalizeRethinkDbResults(teamIds, teams)
    },
    {
      ...parent.dataLoaderOptions
    }
  )

export const serializeUserTasksKey = (key: UserTasksKey) => {
  const {userIds, teamIds, first, after, archived, statusFilters, filterQuery} = key
  const parts = [
    (userIds?.length && userIds.sort().join(':')) || '*',
    teamIds.sort().join(':'),
    first,
    after || '*',
    archived,
    (statusFilters?.length && statusFilters.sort().join(':')) || '*',
    filterQuery || '*'
  ]
  return parts.join(':')
}

export const commentCountByThreadId = (parent: RethinkDataLoader) => {
  return new DataLoader<string, number, string>(
    async (threadIds) => {
      const r = await getRethink()
      const groups = (await (r
        .table('Comment')
        .getAll(r.args(threadIds as string[]), {index: 'threadId'})
        .group('threadId') as any)
        .count()
        .ungroup()
        .run()) as {group: string; reduction: number}[]
      const lookup = {}
      groups.forEach(({group, reduction}) => {
        lookup[group] = reduction
      })
      return threadIds.map((threadId) => lookup[threadId] || 0)
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const reactables = (parent: RethinkDataLoader) => {
  return new DataLoader<ReactablesKey, Reactable, string>(
    async (keys) => {
      const reactableResults = (await Promise.all(
        reactableLoaders.map(async (val) => {
          const ids = keys.filter((key) => key.type === val.type).map(({id}) => id)
          return parent.get(val.loader).loadMany(ids)
        })
      )) as Reactable[][]
      const reactables = reactableResults.flat()
      const keyIds = keys.map(({id}) => id)
      const ret = normalizeRethinkDbResults(keyIds, reactables)
      return ret
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.id}:${key.type}`
    }
  )
}

export const threadSources = (parent: RethinkDataLoader) => {
  return new DataLoader<ThreadSourceKey, ThreadSource, string>(
    async (keys) => {
      const threadableResults = (await Promise.all(
        threadableLoaders.map(async (val) => {
          const ids = keys.filter((key) => key.type === val.type).map(({sourceId}) => sourceId)
          return parent.get(val.loader).loadMany(ids)
        })
      )) as ThreadSource[][]
      const threadables = threadableResults.flat()
      const keyIds = keys.map(({sourceId}) => sourceId)
      return normalizeRethinkDbResults(keyIds, threadables)
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.sourceId}:${key.type}`
    }
  )
}

export const userTasks = (parent: RethinkDataLoader) => {
  return new DataLoader<UserTasksKey, Task[], string>(
    async (keys) => {
      const r = await getRethink()
      const uniqKeys = [] as UserTasksKey[]
      const keySet = new Set()
      keys.forEach((key) => {
        const serializedKey = serializeUserTasksKey(key)
        if (!keySet.has(serializedKey)) {
          keySet.add(serializedKey)
          uniqKeys.push(key)
        }
      })
      const taskLoader = parent.get('tasks')

      const entryArray = await Promise.all(
        uniqKeys.map(async (key) => {
          const {
            first,
            after,
            userIds,
            teamIds,
            archived,
            statusFilters,
            filterQuery,
            includeUnassigned
          } = key
          const dbAfter = after ? new Date(after) : r.maxval

          let teamTaskPartial = r.table('Task').getAll(r.args(teamIds), {index: 'teamId'})
          if (userIds?.length) {
            teamTaskPartial = teamTaskPartial.filter((row) => r(userIds).contains(row('userId')))
          }
          if (statusFilters?.length) {
            teamTaskPartial = teamTaskPartial.filter((row) =>
              r(statusFilters).contains(row('status'))
            )
          }
          if (filterQuery) {
            // TODO: deal with tags like #archived and #private. should strip out of plaintextContent??
            teamTaskPartial = teamTaskPartial.filter(
              (row) => row('plaintextContent').match(filterQuery) as any
            )
          }

          return {
            key: serializeUserTasksKey(key),
            data: await teamTaskPartial
              .filter((task) => task('updatedAt').lt(dbAfter))
              .filter((task) =>
                archived
                  ? task('tags').contains('archived')
                  : task('tags')
                      .contains('archived')
                      .not()
              )
              .filter((task) => {
                if (includeUnassigned) return true
                return task('userId').ne(null)
              })
              .orderBy(r.desc('updatedAt'))
              .limit(first + 1)
              .run()
          }
        })
      )

      const tasksByKey = Object.assign(
        {},
        ...entryArray.map((entry) => ({[entry.key]: entry.data}))
      ) as {[key: string]: Task[]}
      const tasks = Object.values(tasksByKey)
      tasks.flat().forEach((task) => {
        taskLoader.clear(task.id).prime(task.id, task)
      })
      return keys.map((key) => tasksByKey[serializeUserTasksKey(key)])
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: serializeUserTasksKey
    }
  )
}

interface FreshAtlassianAuth extends AtlassianAuth {
  accessToken: string
}
export const freshAtlassianAuth = (parent: RethinkDataLoader) => {
  return new DataLoader<TeamUserKey, FreshAtlassianAuth | null, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({userId, teamId}) => {
          const r = await getRethink()
          const atlassianAuth = await r
            .table('AtlassianAuth')
            .getAll(userId, {index: 'userId'})
            .filter({teamId})
            .nth(0)
            .run()

          if (!atlassianAuth?.refreshToken) return null
          const {accessToken: existingAccessToken, refreshToken} = atlassianAuth
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          const inAMinute = Math.floor((now.getTime() + 60000) / 1000)
          if (!decodedToken || decodedToken.exp < inAMinute) {
            const manager = await AtlassianServerManager.refresh(refreshToken)
            const {accessToken} = manager
            atlassianAuth.accessToken = accessToken
            atlassianAuth.updatedAt = now
            await r
              .table('AtlassianAuth')
              .getAll(userId, {index: 'userId'})
              .filter({teamId})
              .update({accessToken, updatedAt: now})
              .run()
          }
          return atlassianAuth
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.userId}:${key.teamId}`
    }
  )
}

export const githubAuth = (parent: RethinkDataLoader) => {
  return new DataLoader<
    {teamId: string; userId: string},
    GetGitHubAuthByUserIdTeamIdResult | null,
    string
  >(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId}) => getGitHubAuthByUserIdTeamId(userId, teamId))
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, userId}) => `${userId}:${teamId}`
    }
  )
}

export const jiraRemoteProject = (parent: RethinkDataLoader) => {
  return new DataLoader<JiraRemoteProjectKey, string, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({accessToken, cloudId, atlassianProjectId}) => {
          const manager = new AtlassianServerManager(accessToken)
          return manager.getProject(cloudId, atlassianProjectId)
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.atlassianProjectId}:${key.cloudId}`
    }
  )
}

export const jiraIssue = (parent: RethinkDataLoader) => {
  return new DataLoader<JiraIssueKey, JiraGetIssueRes['fields'] | null, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({teamId, userId, cloudId, issueKey}) => {
          const auth = await parent.get('freshAtlassianAuth').load({teamId, userId})
          if (!auth) {
            sendToSentry(new Error('No atlassian access token exists for team member'), {
              userId,
              tags: {teamId}
            })
            return null
          }
          const {accessToken} = auth
          const manager = new AtlassianServerManager(accessToken)
          const issueRes = await manager.getIssue(cloudId, issueKey)
          if ('message' in issueRes) {
            sendToSentry(new Error(issueRes.message), {userId, tags: {cloudId, issueKey, teamId}})
            return null
          }
          if ('errors' in issueRes) {
            const error = issueRes.errors[0]
            sendToSentry(new Error(error), {userId, tags: {cloudId, issueKey, teamId}})
            return null
          }
          return issueRes.fields
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({cloudId, issueKey}) => `${cloudId}:${issueKey}`
    }
  )
}

export const meetingSettingsByType = (parent: RethinkDataLoader) => {
  return new DataLoader<MeetingSettingsKey, RethinkSchema['MeetingSettings']['type'], string>(
    async (keys) => {
      const r = await getRethink()
      const types = {} as Record<MeetingTypeEnum, string[]>
      keys.forEach((key) => {
        const {meetingType} = key
        types[meetingType] = types[meetingType] || []
        types[meetingType].push(key.teamId)
      })
      const entries = Object.entries(types) as [MeetingTypeEnum, string[]][]
      const resultsByType = await Promise.all(
        entries.map((entry) => {
          const [meetingType, teamIds] = entry
          return r
            .table('MeetingSettings')
            .getAll(r.args(teamIds), {index: 'teamId'})
            .filter({meetingType: meetingType})
            .run()
        })
      )
      const docs = resultsByType.flat()
      return keys.map((key) => {
        const {teamId, meetingType} = key
        return docs.find((doc) => doc.teamId === teamId && doc.meetingType === meetingType)!
      })
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.meetingType}`
    }
  )
}

export const meetingTemplatesByType = (parent: RethinkDataLoader) => {
  return new DataLoader<MeetingTemplateKey, MeetingTemplate[], string>(
    async (keys) => {
      const r = await getRethink()
      const types = {} as Record<MeetingTypeEnum, string[]>
      keys.forEach((key) => {
        const {meetingType} = key
        types[meetingType] = types[meetingType] || []
        types[meetingType].push(key.teamId)
      })
      const entries = Object.entries(types) as [MeetingTypeEnum, string[]][]
      const resultsByType = await Promise.all(
        entries.map((entry) => {
          const [meetingType, teamIds] = entry
          return r
            .table('MeetingTemplate')
            .getAll(r.args(teamIds), {index: 'teamId'})
            .filter({type: meetingType, isActive: true})
            .run()
        })
      )
      const docs = resultsByType.flat()
      return keys.map((key) => {
        const {teamId, meetingType} = key
        return docs.filter((doc) => doc.teamId === teamId && doc.type === meetingType)!
      })
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.meetingType}`
    }
  )
}
