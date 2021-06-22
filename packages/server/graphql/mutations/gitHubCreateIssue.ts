import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import GitHubCreateIssuePayload from '../types/GitHubCreateIssuePayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import GitHubServerManager from '../../utils/GitHubServerManager'
import standardError from '../../utils/standardError'

const gitHubCreateIssue = {
  type: GraphQLNonNull(GitHubCreateIssuePayload),
  description: 'Create an issue in GitHub',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the meeting where the GitHub issue is being created'
    },
    nameWithOwner: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The owner/repo string'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team that is creating the issue'
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the GH issue'
    }
  },
  resolve: async (
    _source,
    {
      meetingId,
      nameWithOwner,
      teamId,
      title
    }: {meetingId: string; nameWithOwner: string; teamId: string; title: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const viewerAuth = await dataLoader.get('githubAuth').load({teamId, userId: viewerId})
    if (!viewerAuth?.isActive) {
      return standardError(new Error('The viewer does not have access to GitHub'), {
        userId: viewerId
      })
    }
    const [repoOwner, repoName] = nameWithOwner.split('/')
    if (!repoOwner || !repoName) {
      return standardError(new Error(`${nameWithOwner} is not a valid repository`), {
        userId: viewerId
      })
    }

    // RESOLUTION
    const {accessToken} = viewerAuth
    const manager = new GitHubServerManager(accessToken)
    const repoInfo = await manager.getRepoInfo(nameWithOwner, viewerAuth.login)
    if ('message' in repoInfo) {
      return standardError(new Error(repoInfo.message), {userId: viewerId})
    }
    if (!repoInfo.data || !repoInfo.data.repository || !repoInfo.data.user) {
      console.log(JSON.stringify(repoInfo))
      return standardError(new Error(repoInfo.errors![0]), {userId: viewerId})
    }
    const {
      data: {repository, user}
    } = repoInfo
    const {id: repositoryId} = repository
    const {id: ghAssigneeId} = user
    const createIssueRes = await manager.createIssue({
      title,
      repositoryId,
      assigneeIds: [ghAssigneeId]
    })
    if ('message' in createIssueRes) {
      return standardError(new Error(createIssueRes.message), {userId: viewerId})
    }
    const {data: payload} = createIssueRes
    if (!payload || !payload.createIssue || !payload.createIssue.issue) {
      return standardError(new Error('createIssueRes does not contain expected payload'), {
        userId: viewerId
      })
    }
    const {createIssue} = payload
    const issue = createIssue.issue!
    const {id: gitHubIssueId, number: issueNumber} = issue
    const url = `https://github.com/${nameWithOwner}/issues/${issueNumber}`
    const gitHubIssue = {
      id: gitHubIssueId,
      summary: title,
      url,
      nameWithOwner,
      description: ''
    }

    const data = {meetingId, teamId, gitHubIssue}
    publish(SubscriptionChannel.MEETING, meetingId, 'GitHubCreateIssueSuccess', data, subOptions)
    return data
  }
}

export default gitHubCreateIssue
