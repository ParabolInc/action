import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInterfaceType,
  GraphQLBoolean
} from 'graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import SharingScopeEnum from './SharingScopeEnum'
import Team from './Team'

export const meetingTemplateFields = () => ({
  id: {
    type: GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type)
  },
  isActive: {
    type: new GraphQLNonNull(GraphQLBoolean),
    description: 'True if template can be used, else false'
  },
  lastUsedAt: {
    type: GraphQLISO8601Type,
    description: 'The time of the meeting the template was last used'
  },
  name: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'The name of the template'
  },
  orgId: {
    type: GraphQLNonNull(GraphQLID),
    description: '*Foreign key. The organization that owns the team that created the template'
  },
  scope: {
    type: GraphQLNonNull(SharingScopeEnum),
    description: 'Who can see this template'
  },
  teamId: {
    type: new GraphQLNonNull(GraphQLID),
    description: '*Foreign key. The team this template belongs to'
  },
  team: {
    type: new GraphQLNonNull(Team),
    description: 'The team this template belongs to',
    resolve: async ({teamId}, _args, {dataLoader}) => {
      const team = await dataLoader.get('teams').load(teamId)
      return team
    }
  },
  type: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'The type of the template'
  },
  updatedAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type)
  }
})

const MeetingTemplate = new GraphQLInterfaceType({
  name: 'MeetingTemplate',
  description: 'A meeting template that can be shared across team, orgnization and public',
  fields: meetingTemplateFields
})

export default MeetingTemplate
