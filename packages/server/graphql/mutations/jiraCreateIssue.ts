import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import MeetingMember from '../../database/types/MeetingMember'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import JiraCreateIssuePayload from '../types/JiraCreateIssuePayload'

type JiraCreateIssueMutationVariables = {
  cloudId: string
  projectKey: string
  summary: string
  teamId: string
  meetingId?: string | null
}
export default {
  name: 'JiraCreateIssue',
  type: JiraCreateIssuePayload,
  args: {
    cloudId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The atlassian cloudId for the site'
    },
    meetingId: {
      type: GraphQLID,
      description:
        'The id of the meeting where the Jira issue is being created. Null if it is not being created in a meeting.'
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The atlassian key of the project to put the issue in'
    },
    summary: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The text content of the Jira issue'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team that is creating the issue'
    }
  },
  resolve: async (
    _source: Record<string, unknown>,
    {cloudId, meetingId, projectKey, summary, teamId}: JiraCreateIssueMutationVariables,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const viewerAuth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: viewerId})
    if (!viewerAuth?.isActive) {
      return standardError(new Error('The viewer does not have access to Jira'), {
        userId: viewerId
      })
    }

    if (meetingId) {
      const meetingMember = (await r
        .table('MeetingMember')
        .getAll(meetingId, {index: 'meetingId'})
        .filter({userId: viewerId})
        .nth(0)
        .default(null)
        .run()) as MeetingMember | null
      if (!meetingMember) {
        return standardError(new Error('Meeting member not found'), {userId: viewerId})
      }
      if (meetingMember.teamId !== teamId)
        return standardError(new Error('Meeting is not owned by the same team'), {userId: viewerId})
    }

    // RESOLUTION
    const {accessToken} = viewerAuth
    const manager = new AtlassianServerManager(accessToken)
    const [sites, issueMetaRes, description] = await Promise.all([
      manager.getAccessibleResources(),
      manager.getCreateMeta(cloudId, [projectKey]),
      manager.convertMarkdownToADF(summary)
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
    const {issuetypes} = project
    const bestType = issuetypes.find((type) => type.name === 'Task') || issuetypes[0]
    const payload = {
      summary,
      description,
      // ERROR: Field 'reporter' cannot be set. It is not on the appropriate screen, or unknown.
      assignee: {
        id: viewerAuth.accountId
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
    const data = {
      cloudId,
      key: res.key,
      meetingId,
      teamId,
      userId: viewerId
    }
    if (meetingId) {
      publish(SubscriptionChannel.MEETING, meetingId, 'JiraCreateIssuePayload', data, subOptions)
    }
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
