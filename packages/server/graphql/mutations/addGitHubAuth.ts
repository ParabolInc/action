import {GraphQLID, GraphQLNonNull} from 'graphql'
import upsertGitHubAuth from '../../postgres/queries/upsertGitHubAuth'
import {getUserId, isTeamMember} from '../../utils/authorization'
import GitHubServerManager from '../../utils/GitHubServerManager'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import AddGitHubAuthPayload from '../types/AddGitHubAuthPayload'
export default {
  name: 'AddGitHubAuth',
  type: new GraphQLNonNull(AddGitHubAuthPayload),
  args: {
    code: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (_source, {code, teamId}, {authToken}) => {
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    // RESOLUTION

    const manager = await GitHubServerManager.init(code)
    const {accessToken} = manager
    const profile = await manager.getProfile()

    if ('message' in profile) {
      return standardError(new Error(profile.message), {userId: viewerId})
    }

    if (Array.isArray(profile.errors)) {
      console.error(profile.errors[0])
      return standardError(new Error(profile.errors[0].message), {userId: viewerId})
    }

    const {data: profileData} = profile
    if (!profileData || !profileData.viewer) {
      return standardError(new Error('No profileData provided from GitHub'), {userId: viewerId})
    }
    const {viewer} = profileData
    const {login} = viewer

    await upsertGitHubAuth({accessToken, login, teamId, userId: viewerId})
    segmentIo.track({
      userId: viewerId,
      event: 'Added Integration',
      properties: {
        teamId,
        service: 'GitHub'
      }
    })
    return {teamId, userId: viewerId}
  }
}
