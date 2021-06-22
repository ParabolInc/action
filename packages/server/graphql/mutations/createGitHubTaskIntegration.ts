import {ContentState, convertFromRaw} from 'draft-js'
import {stateToMarkdown} from 'draft-js-export-markdown'
import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import GitHubServerManager from '../../utils/GitHubServerManager'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import CreateGitHubTaskIntegrationPayload from '../types/CreateGitHubTaskIntegrationPayload'

type CreateGitHubTaskIntegrationMutationVariables = {
  nameWithOwner: string
  taskId: string
}
export default {
  name: 'CreateGitHubTaskIntegration',
  type: CreateGitHubTaskIntegrationPayload,
  args: {
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the task to convert to a GH issue'
    },
    nameWithOwner: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The owner/repo string'
    }
  },
  resolve: async (
    _source: any,
    {nameWithOwner, taskId}: CreateGitHubTaskIntegrationMutationVariables,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const task = await r
      .table('Task')
      .get(taskId)
      .run()
    if (!task) {
      return standardError(new Error('Task not found'), {userId: viewerId})
    }
    const {teamId} = task
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    if (task.integration) {
      return standardError(
        new Error(`That task is already linked to ${task.integration.service}`),
        {userId: viewerId}
      )
    }
    const [repoOwner, repoName] = nameWithOwner.split('/')
    if (!repoOwner || !repoName) {
      return standardError(new Error(`${nameWithOwner} is not a valid repository`), {
        userId: viewerId
      })
    }

    // RESOLUTION
    const {userId, content: rawContentStr, meetingId} = task
    const [viewerAuth, assigneeAuth] = await dataLoader.get('githubAuth').loadMany([
      {teamId, userId: viewerId},
      {teamId, userId}
    ])

    if (!assigneeAuth || !assigneeAuth.isActive) {
      return standardError(
        new Error(`Assignment failed! The assignee does not have access to GitHub`),
        {userId: viewerId}
      )
    }

    const rawContent = JSON.parse(rawContentStr)
    const {blocks} = rawContent
    let {text: title} = blocks[0]
    // if the title exceeds 256, repeat it in the body because it probably has entities in it
    if (title.length <= 256) {
      blocks.shift()
    } else {
      title = title.slice(0, 256)
    }
    const contentState =
      blocks.length === 0 ? ContentState.createFromText('') : convertFromRaw(rawContent)
    let body = stateToMarkdown(contentState)
    if (!viewerAuth) {
      const viewer = await dataLoader.get('users').load(viewerId)
      body = `${body}\n\n_Added by ${viewer.preferredName}_`
    }
    const {accessToken} = viewerAuth || assigneeAuth
    const manager = new GitHubServerManager(accessToken)

    const repoInfo = await manager.getRepoInfo(nameWithOwner, assigneeAuth.login)
    if ('message' in repoInfo) {
      return {error: repoInfo}
    }
    if (!repoInfo.data || !repoInfo.data.repository || !repoInfo.data.user) {
      console.log(JSON.stringify(repoInfo))
      return {error: repoInfo.errors![0]}
    }
    const {
      data: {repository, user}
    } = repoInfo
    const {id: repositoryId} = repository
    const {id: ghAssigneeId} = user
    const createIssueRes = await manager.createIssue({
      title,
      body,
      repositoryId,
      assigneeIds: [ghAssigneeId]
    })
    if ('message' in createIssueRes) {
      return {error: createIssueRes}
    }

    const {errors, data: payload} = createIssueRes
    if (!payload || !payload.createIssue || !payload.createIssue.issue) {
      return {error: errors![0]}
    }
    const {createIssue} = payload
    const issue = createIssue.issue!
    const {id: issueId, number: issueNumber} = issue

    await r
      .table('Task')
      .get(taskId)
      .update({
        integration: {
          id: issueId,
          service: 'github',
          issueNumber,
          nameWithOwner
        },
        updatedAt: now
      })
      .run()
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    const data = {taskId}
    teamMembers.forEach(({userId}) => {
      publish(
        SubscriptionChannel.TASK,
        userId,
        'CreateGitHubTaskIntegrationPayload',
        data,
        subOptions
      )
    })
    segmentIo.track({
      userId: viewerId,
      event: 'Published Task to GitHub',
      properties: {
        teamId,
        meetingId
      }
    })
    return data
  }
}
