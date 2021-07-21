import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import JiraIssueId from 'parabol-client/shared/gqlIds/JiraIssueId'
import {JiraGetIssueRes, JiraProject} from 'parabol-client/utils/AtlassianManager'
import getAtlassianAuthByUserIdTeamId, {
  AtlassianAuth
} from '../postgres/queries/getAtlassianAuthByUserIdTeamId'
import upsertAtlassianAuth from '../postgres/queries/upsertAtlassianAuth'
import AtlassianServerManager from '../utils/AtlassianServerManager'
import sendToSentry from '../utils/sendToSentry'
import RethinkDataLoader from './RethinkDataLoader'
import {downloadAndCacheImages, updateJiraImageUrls} from '../utils/atlassian/jiraImages'

type TeamUserKey = {teamId: string; userId: string}
export interface JiraRemoteProjectKey {
  userId: string
  teamId: string
  cloudId: string
  projectKey: string
}

export interface JiraIssueKey {
  teamId: string
  userId: string
  cloudId: string
  issueKey: string
}

export const freshAtlassianAuth = (parent: RethinkDataLoader) => {
  return new DataLoader<TeamUserKey, AtlassianAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId}) => {
          const atlassianAuth = await getAtlassianAuthByUserIdTeamId(userId, teamId)

          if (!atlassianAuth?.refreshToken) {
            // Not always an error! For suggested integrations, this won't exist.
            // sendToSentry(new Error('No atlassian access token exists for team member'), {
            //   userId,
            //   tags: {teamId}
            // })
            return null
          }
          const {accessToken: existingAccessToken, refreshToken} = atlassianAuth
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          const inAMinute = Math.floor((now.getTime() + 60000) / 1000)
          if (!decodedToken || decodedToken.exp < inAMinute) {
            const manager = await AtlassianServerManager.refresh(refreshToken)
            const {accessToken} = manager
            atlassianAuth.accessToken = accessToken
            atlassianAuth.updatedAt = now

            await upsertAtlassianAuth(atlassianAuth)
          }
          return atlassianAuth
        })
      )
      const res = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return res
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.userId}:${key.teamId}`
    }
  )
}

export const jiraRemoteProject = (parent: RethinkDataLoader) => {
  return new DataLoader<JiraRemoteProjectKey, JiraProject | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({userId, teamId, cloudId, projectKey}) => {
          const auth = await parent.get('freshAtlassianAuth').load({teamId, userId})
          if (!auth) return null
          const {accessToken} = auth
          const manager = new AtlassianServerManager(accessToken)
          const projectRes = await manager.getProject(cloudId, projectKey)
          if (projectRes instanceof Error) {
            sendToSentry(projectRes, {userId, tags: {teamId, projectKey}})
            return null
          }
          return projectRes
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.projectKey}:${key.cloudId}`
    }
  )
}

export const jiraIssue = (parent: RethinkDataLoader) => {
  return new DataLoader<JiraIssueKey, JiraGetIssueRes['fields'] | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId, cloudId, issueKey}) => {
          const auth = await parent.get('freshAtlassianAuth').load({teamId, userId})
          if (!auth) return null
          const {accessToken} = auth
          const manager = new AtlassianServerManager(accessToken)
          const issueRes = await manager.getIssue(cloudId, issueKey)
          if (issueRes instanceof Error) {
            sendToSentry(issueRes, {userId, tags: {cloudId, issueKey, teamId}})
            return null
          }
          const {updatedDescription, imageUrlToHash} = updateJiraImageUrls(
            cloudId,
            issueRes.fields.descriptionHTML
          )
          downloadAndCacheImages(accessToken, imageUrlToHash)

          return {
            ...issueRes.fields,
            descriptionHTML: updatedDescription,
            teamId,
            userId
          }
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : null))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({cloudId, issueKey}) => JiraIssueId.join(cloudId, issueKey)
    }
  )
}

interface CloudNameLookup {
  [cloudId: string]: string
}
export const atlassianCloudNameLookup = (parent: RethinkDataLoader) => {
  return new DataLoader<TeamUserKey, CloudNameLookup, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId}) => {
          const auth = await parent.get('freshAtlassianAuth').load({teamId, userId})
          if (!auth) return {}
          const {accessToken} = auth
          const manager = new AtlassianServerManager(accessToken)
          const result = await manager.getCloudNameLookup()
          if (result instanceof Error) {
            sendToSentry(result, {userId, tags: {teamId}})
            return {}
          }
          return result
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : {}))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, userId}) => `${teamId}:${userId}`
    }
  )
}

interface CloudNameKey extends TeamUserKey {
  cloudId: string
}

export const atlassianCloudName = (parent: RethinkDataLoader) => {
  return new DataLoader<CloudNameKey, string, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({cloudId, teamId, userId}) => {
          const lookup = await parent.get('atlassianCloudNameLookup').load({teamId, userId})
          return lookup[cloudId] ?? ''
        })
      )
      return results.map((result) => (result.status === 'fulfilled' ? result.value : ''))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({cloudId}) => cloudId
    }
  )
}
