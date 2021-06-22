import {ContentState, convertFromRaw} from 'draft-js'
import {stateToMarkdown} from 'draft-js-export-markdown'
import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import db from '../../db'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import CreateJiraTaskIntegrationPayload from '../types/CreateJiraTaskIntegrationPayload'

type CreateJiraTaskIntegrationMutationVariables = {
  cloudId: string
  taskId: string
  projectKey: string
}
export default {
  name: 'CreateJiraTaskIntegration',
  type: CreateJiraTaskIntegrationPayload,
  args: {
    cloudId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The atlassian cloudId for the site'
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The atlassian key of the project to put the issue in'
    },
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the task to convert to a Jira issue'
    }
  },
  resolve: async (
    _source: Record<string, unknown>,
    {cloudId, projectKey, taskId}: CreateJiraTaskIntegrationMutationVariables,
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
    const {content: rawContentStr, teamId, userId, meetingId} = task
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    if (!userId) {
      // we should probably remove this constraint in the future
      return {error: {message: 'Task must have assignee before it can be integrated with Jira'}}
    }

    // VALIDATION
    if (task.integration) {
      return standardError(
        new Error(`That task is already linked to ${task.integration.service}`),
        {userId: viewerId}
      )
    }

    const [viewerAuth, assigneeAuth] = await dataLoader.get('freshAtlassianAuth').loadMany([
      {teamId, userId: viewerId},
      {teamId, userId}
    ])

    const validAssigneeAuth =
      !(assigneeAuth instanceof Error) && assigneeAuth?.isActive ? assigneeAuth : null
    const validViewerAuth =
      !(viewerAuth instanceof Error) && viewerAuth?.isActive ? viewerAuth : null

    if (!validAssigneeAuth) {
      return standardError(new Error('The assignee does not have access to Jira'), {
        userId: viewerId
      })
    }

    // RESOLUTION
    const rawContent = JSON.parse(rawContentStr)
    const {blocks} = rawContent
    let {text: summary} = blocks[0]
    // if the summary exceeds 256, repeat it in the body because it probably has entities in it
    if (summary.length <= 256) {
      blocks.shift()
    } else {
      summary = summary.slice(0, 256)
    }

    const contentState =
      blocks.length === 0 ? ContentState.createFromText('') : convertFromRaw(rawContent)
    let markdown = stateToMarkdown(contentState)

    // const isViewerAllowed = viewerAuth && !(viewerAuth instanceof Error) ? viewerAuth.isActive : false
    if (!validViewerAuth) {
      const creator = await db.read('User', viewerId)
      const creatorName = creator.preferredName
      markdown = `${markdown}\n\n_Added by ${creatorName}_`
    }

    const {accessToken} = validViewerAuth || validAssigneeAuth
    const manager = new AtlassianServerManager(accessToken)

    const [sites, issueMetaRes, description] = await Promise.all([
      manager.getAccessibleResources(),
      manager.getCreateMeta(cloudId, [projectKey]),
      manager.convertMarkdownToADF(markdown)
    ] as const)
    if ('message' in sites) {
      return standardError(new Error(sites.message), {userId: viewerId})
    }
    if ('message' in issueMetaRes) {
      return standardError(new Error(issueMetaRes.message), {userId: viewerId})
    }
    if ('errors' in issueMetaRes) {
      return standardError(new Error(Object.values(issueMetaRes.errors)[0]), {userId: viewerId})
    }
    if ('errorMessages' in issueMetaRes) {
      return {error: {message: issueMetaRes.errorMessages[0]}}
    }
    const {projects} = issueMetaRes
    // should always be the first and only item in the project arr
    const project = projects.find((project) => project.key === projectKey)!
    const {issuetypes, name: projectName} = project
    const bestType = issuetypes.find((type) => type.name === 'Task') || issuetypes[0]
    const payload = {
      summary,
      description,
      // ERROR: Field 'reporter' cannot be set. It is not on the appropriate screen, or unknown.
      assignee: {
        id: validAssigneeAuth.accountId
      },
      issuetype: {
        id: bestType.id
      }
    }
    const res = await manager.createIssue(cloudId, projectKey, payload)
    if ('message' in res) {
      return standardError(new Error(res.message), {userId: viewerId})
    }
    if ('errors' in res) {
      return standardError(new Error(Object.values(res.errors)[0]), {userId: viewerId})
    }
    if ('errorMessages' in res) {
      return {error: {message: res.errorMessages[0]}}
    }

    const cloud = sites.find((site) => site.id === cloudId)!
    await r
      .table('Task')
      .get(taskId)
      .update({
        integration: {
          id: res.id,
          service: 'jira',
          projectKey,
          projectName,
          cloudId,
          cloudName: cloud.name,
          issueKey: res.key
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
        'CreateJiraTaskIntegrationPayload',
        data,
        subOptions
      )
    })
    segmentIo.track({
      userId: viewerId,
      event: 'Published Task to Jira',
      properties: {
        teamId,
        meetingId
      }
    })
    return data
  }
}
