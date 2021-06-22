import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {MeetingTypeEnum} from '../../database/types/Meeting'
import db from '../../db'
import {GQLContext} from '../graphql'
import connectionFromTemplateArray from '../queries/helpers/connectionFromTemplateArray'
import getPublicScoredTemplates from '../queries/helpers/getPublicScoredTemplates'
import getScoredTemplates from '../queries/helpers/getScoredTemplates'
import resolveSelectedTemplate from '../queries/helpers/resolveSelectedTemplate'
import ReflectTemplate, {ReflectTemplateConnection} from './ReflectTemplate'
import TeamMeetingSettings, {teamMeetingSettingsFields} from './TeamMeetingSettings'

const RetrospectiveMeetingSettings = new GraphQLObjectType<any, GQLContext>({
  name: 'RetrospectiveMeetingSettings',
  description: 'The retro-specific meeting settings',
  interfaces: () => [TeamMeetingSettings],
  fields: () => ({
    ...teamMeetingSettingsFields(),
    totalVotes: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The total number of votes each team member receives for the voting phase'
    },
    maxVotesPerGroup: {
      type: new GraphQLNonNull(GraphQLInt),
      description:
        'The maximum number of votes a team member can vote for a single reflection group'
    },
    selectedTemplateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'FK. The template that will be used to start the retrospective'
    },
    selectedTemplate: {
      type: GraphQLNonNull(ReflectTemplate),
      description: 'The template that will be used to start the retrospective',
      resolve: resolveSelectedTemplate('workingStuckTemplate')
    },
    reflectTemplates: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReflectTemplate))),
      description: 'The list of templates used to start a retrospective',
      deprecatedReason: 'renamed to teamTemplates',
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader.get('meetingTemplatesByType').load({teamId, meetingType: 'retrospective'})
      }
    },
    teamTemplates: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReflectTemplate))),
      description: 'The list of templates used to start a retrospective',
      resolve: async ({teamId}, _args, {dataLoader}) => {
        const templates = await dataLoader
          .get('meetingTemplatesByType')
          .load({teamId, meetingType: 'retrospective' as MeetingTypeEnum})
        const scoredTemplates = await getScoredTemplates(templates, 0.9)
        return scoredTemplates
      }
    },
    organizationTemplates: {
      type: GraphQLNonNull(ReflectTemplateConnection),
      args: {
        first: {
          type: GraphQLNonNull(GraphQLInt)
        },
        after: {
          type: GraphQLID,
          description: 'The cursor, which is the templateId'
        }
      },
      description: 'The list of templates shared across the organization to start a retrospective',
      resolve: async ({teamId}, {first, after}, {dataLoader}) => {
        const team = await dataLoader.get('teams').load(teamId)
        const {orgId} = team
        const templates = await dataLoader.get('meetingTemplatesByOrgId').load(orgId)
        const organizationTemplates = templates.filter(
          (template) =>
            template.scope !== 'TEAM' &&
            template.teamId !== teamId &&
            (template.type as MeetingTypeEnum) === 'retrospective'
        )
        const scoredTemplates = await getScoredTemplates(organizationTemplates, 0.8)
        return connectionFromTemplateArray(scoredTemplates, first, after)
      }
    },
    publicTemplates: {
      type: GraphQLNonNull(ReflectTemplateConnection),
      description: 'The list of templates shared across the organization to start a retrospective',
      args: {
        first: {
          type: GraphQLNonNull(GraphQLInt)
        },
        after: {
          type: GraphQLID,
          description: 'The cursor, which is the templateId'
        }
      },
      resolve: async ({teamId}, {first, after}, {dataLoader}) => {
        const [publicTemplates, team] = await Promise.all([
          db.read('publicTemplates', 'retrospective' as MeetingTypeEnum),
          dataLoader.get('teams').load(teamId)
        ])
        const {orgId} = team
        const unownedTemplates = publicTemplates.filter((template) => template.orgId !== orgId)
        const scoredTemplates = await getPublicScoredTemplates(unownedTemplates)
        return connectionFromTemplateArray(scoredTemplates, first, after)
      }
    }
  })
})

export default RetrospectiveMeetingSettings
