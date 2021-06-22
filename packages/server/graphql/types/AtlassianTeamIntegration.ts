import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import JiraDimensionField from './JiraDimensionField'

const AtlassianTeamIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'AtlassianTeamIntegration',
  description: 'The atlassian integration details shared across an entire team',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid',
      resolve: ({id: teamId}) => `atlassianTeamIntegration:${teamId}`
    },
    jiraDimensionFields: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(JiraDimensionField))),
      description: 'The dimensions and their corresponding Jira fields',
      resolve: ({jiraDimensionFields}) => jiraDimensionFields || []
    }
  })
})

export default AtlassianTeamIntegration
