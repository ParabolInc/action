import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import AtlassianTeamIntegration from './AtlassianTeamIntegration'

const TeamIntegrations = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamIntegrations',
  description: 'All the available integrations available for this team member',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'composite',
      resolve: ({id: teamId}) => `integrations:${teamId}`
    },
    atlassian: {
      type: GraphQLNonNull(AtlassianTeamIntegration),
      description: 'All things associated with an atlassian integration for a team member',
      resolve: async (source) => source
    }
  })
})

export default TeamIntegrations
