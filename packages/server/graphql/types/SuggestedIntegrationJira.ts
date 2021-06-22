import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import JiraRemoteProject from './JiraRemoteProject'
import SuggestedIntegration, {suggestedIntegrationFields} from './SuggestedIntegration'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'

const SuggestedIntegrationJira = new GraphQLObjectType<any, GQLContext>({
  name: 'SuggestedIntegrationJira',
  description: 'The details associated with a task integrated with Jira',
  interfaces: () => [SuggestedIntegration],
  fields: () => ({
    ...suggestedIntegrationFields(),
    avatar: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'URL to a 24x24 avatar icon'
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The project key used by jira as a more human readable proxy for a projectId'
    },
    projectName: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The name of the project, prefixed with the cloud name if more than 1 cloudId exists'
    },
    cloudId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The cloud ID that the project lives on'
    },
    remoteProject: {
      type: JiraRemoteProject,
      description: 'The full project document fetched from Jira',
      resolve: async ({cloudId, projectId, teamId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: viewerId})
        if (!auth) return null
        const {accessToken} = auth
        const project = await dataLoader
          .get('jiraRemoteProject')
          .load({accessToken, cloudId, atlassianProjectId: projectId})
        return project
      }
    }
  })
})

export default SuggestedIntegrationJira
