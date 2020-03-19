import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import {ReactableEnum, ThreadSourceEnum} from 'parabol-client/types/graphql'
import promiseAllPartial from 'parabol-client/utils/promiseAllPartial'
import getRethink from '../database/rethinkDriver'
import {Reactable} from '../database/types/Reactable'
import Task from '../database/types/Task'
import {ThreadSource} from '../database/types/ThreadSource'
import AtlassianServerManager from '../utils/AtlassianServerManager'
import AzureDevopsManager from '../utils/AzureDevopsManager'
import normalizeRethinkDbResults from './normalizeRethinkDbResults'
import RethinkDataLoader from './RethinkDataLoader'

type AccessTokenKey = {teamId: string; userId: string}
interface JiraRemoteProjectKey {
  accessToken: string
  cloudId: string
  atlassianProjectId: string
}

interface AzureDevopsRemoteProjectKey {
  accessToken: string
  organization: string
  azureDevopsProjectId: string
}

interface UserTasksKey {
  userId: string
  teamIds: string[]
}

interface ReactablesKey {
  id: string
  type: ReactableEnum
}

interface ThreadSourceKey {
  sourceId: string
  type: ThreadSourceEnum
}

const reactableLoaders = [
  {type: ReactableEnum.COMMENT, loader: 'comments'},
  {type: ReactableEnum.REFLECTION, loader: 'retroReflections'}
] as const

const threadableLoaders = [
  {type: ThreadSourceEnum.AGENDA_ITEM, loader: 'agendaItems'},
  {type: ThreadSourceEnum.REFLECTION_GROUP, loader: 'retroReflectionGroups'}
] as const

// export type LoaderMakerCustom<K, V, C = K> = (parent: RethinkDataLoader) => DataLoader<K, V, C>

// TODO: refactor if the interface pattern is used a total of 3 times
export const reactables = (parent: RethinkDataLoader) => {
  return new DataLoader<ReactablesKey, Reactable, string>(
    async (keys) => {
      const reactableResults = (await Promise.all(
        reactableLoaders.map((val) => {
          const ids = keys.filter((key) => key.type === val.type).map(({id}) => id)
          return parent.get(val.loader).loadMany(ids)
        })
      )) as Reactable[][]
      const reactables = reactableResults.flat()
      const keyIds = keys.map(({id}) => id)
      const ret = normalizeRethinkDbResults(keyIds, reactables)
      console.log('react', ret)
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
        threadableLoaders.map((val) => {
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
      const userIds = keys.map(({userId}) => userId)
      const teamIds = Array.from(new Set(keys.flatMap(({teamIds}) => teamIds)))
      const taskLoader = parent.get('tasks')
      const allUsersTasks = (await r
        .table('Task')
        .getAll(r.args(userIds), {index: 'userId'})
        .filter((task) => r(teamIds).contains(task('teamId')))
        .filter((task) =>
          task('tags')
            .contains('archived')
            .not()
        )
        .run()) as Task[]
      allUsersTasks.forEach((task) => {
        taskLoader.clear(task.id).prime(task.id, task)
      })
      return keys.map((key) =>
        allUsersTasks.filter(
          (task) => task.userId === key.userId && key.teamIds.includes(task.teamId)
        )
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.userId}:${key.teamIds.sort().join(':')}`
    }
  )
}

export const freshAtlassianAccessToken = (parent: RethinkDataLoader) => {
  const userAuthLoader = parent.get('atlassianAuthByUserId')
  return new DataLoader<AccessTokenKey, string, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({userId, teamId}) => {
          const userAuths = await userAuthLoader.load(userId)
          const teamAuth = userAuths.find((auth) => auth.teamId === teamId)
          if (!teamAuth || !teamAuth.refreshToken) return null
          const {accessToken: existingAccessToken, refreshToken} = teamAuth
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          if (decodedToken && decodedToken.exp >= Math.floor(now.getTime() / 1000)) {
            return existingAccessToken
          }
          // fetch a new one
          const manager = await AtlassianServerManager.refresh(refreshToken)
          const {accessToken} = manager
          const r = await getRethink()
          await r
            .table('AtlassianAuth')
            .getAll(userId, {index: 'userId'})
            .filter({teamId})
            .update({accessToken, updatedAt: now})
            .run()
          return accessToken
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.userId}:${key.teamId}`
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

// Azure Devops
export const freshAzureDevopsAccessToken = (parent: RethinkDataLoader) => {
  const userAuthLoader = parent.get('azureDevopsAuthByUserId')
  return new DataLoader<AccessTokenKey, string, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({userId, teamId}) => {
          const userAuths = await userAuthLoader.load(userId)
          const teamAuth = userAuths.find((auth) => auth.teamId === teamId)
          if (!teamAuth || !teamAuth.refreshToken) return null
          const {accessToken: existingAccessToken, refreshToken} = teamAuth
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          if (decodedToken && decodedToken.exp >= Math.floor(now.getTime() / 1000)) {
            return existingAccessToken
          }
          // fetch a new one
          const manager = await AzureDevopsManager.refresh(refreshToken)
          const {accessToken} = manager
          const r = await getRethink()
          await r
            .table('AzureDevopsAuth')
            .getAll(userId, {index: 'userId'})
            .filter({teamId})
            .update({accessToken, updatedAt: now})
            .run()
          return accessToken
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.userId}:${key.teamId}`
    }
  )
}

export const azureDevopsRemoteProject = (parent: RethinkDataLoader) => {
  return new DataLoader<AzureDevopsRemoteProjectKey, string, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({accessToken, organization, azureDevopsProjectId}) => {
          const manager = new AzureDevopsManager(accessToken)
          return manager.getProject(cloudId, atlassianProjectId)
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.azureDevopsProjectId}:${key.organization}`
    }
  )
}
