import {GraphQLObjectType} from 'graphql'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import {GQLContext} from '../graphql'
import GitHubIntegration from './GitHubIntegration'
import StandardMutationError from './StandardMutationError'
import TeamMember from './TeamMember'
import User from './User'

const AddGitHubAuthPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddGitHubAuthPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    githubIntegration: {
      type: GitHubIntegration,
      description: 'The newly created auth',
      resolve: async ({teamId, userId}, _args, {dataLoader}) => {
        return dataLoader.get('githubAuth').load({teamId, userId})
      }
    },
    teamMember: {
      type: TeamMember,
      description: 'The team member with the updated auth',
      resolve: ({teamId, userId}, _args, {dataLoader}) => {
        const teamMemberId = toTeamMemberId(teamId, userId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    user: {
      type: User,
      description: 'The user with updated githubAuth',
      resolve: ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default AddGitHubAuthPayload
