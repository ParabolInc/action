import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMemberIntegrationsId from '../../../client/shared/gqlIds/TeamMemberIntegrationsId'
import {isTeamMember} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import AtlassianIntegration from './AtlassianIntegration'
import GitHubIntegration from './GitHubIntegration'
import SlackIntegration from './SlackIntegration'
const TeamMemberIntegrations = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamMemberIntegrations',
  description: 'All the available integrations available for this team member',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'composite',
      resolve: ({teamId, userId}) => TeamMemberIntegrationsId.join(teamId, userId)
    },
    atlassian: {
      type: AtlassianIntegration,
      description: 'All things associated with an atlassian integration for a team member',
      resolve: async ({teamId, userId}, _args, {authToken, dataLoader}) => {
        if (!isTeamMember(authToken, teamId)) return null
        const atlassianIntegration = await dataLoader
          .get('freshAtlassianAuth')
          .load({teamId, userId})
        return atlassianIntegration
      }
    },
    github: {
      type: GitHubIntegration,
      description: 'All things associated with a GitHub integration for a team member',
      resolve: async ({teamId, userId}, _args, {authToken, dataLoader}) => {
        if (!isTeamMember(authToken, teamId)) return null
        return dataLoader.get('githubAuth').load({teamId, userId})
      }
    },
    slack: {
      type: SlackIntegration,
      description: 'All things associated with a slack integration for a team member',
      resolve: async ({teamId, userId}, _args, {authToken, dataLoader}) => {
        if (!isTeamMember(authToken, teamId)) return null
        const auths = await dataLoader.get('slackAuthByUserId').load(userId)
        return auths.find((auth) => auth.teamId === teamId)
      }
    }
  })
})

export default TeamMemberIntegrations
