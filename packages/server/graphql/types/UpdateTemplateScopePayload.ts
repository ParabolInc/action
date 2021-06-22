import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {MeetingTypeEnum} from '../../database/types/Meeting'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import MeetingTemplate from './MeetingTemplate'
import TeamMeetingSettings from './TeamMeetingSettings'

export const UpdateTemplateScopeSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateTemplateScopeSuccess',
  fields: () => ({
    template: {
      type: GraphQLNonNull(MeetingTemplate),
      description:
        'the template that was just updated, if downscoped, does not provide whole story',
      resolve: async ({templateId}, _args, {dataLoader}) => {
        return dataLoader.get('meetingTemplates').load(templateId)
      }
    },
    clonedTemplate: {
      type: MeetingTemplate,
      description: 'if downscoping a previously used template, this will be the replacement',
      resolve: async ({clonedTemplateId}, _args, {dataLoader}) => {
        return clonedTemplateId ? dataLoader.get('meetingTemplates').load(clonedTemplateId) : null
      }
    },
    settings: {
      type: GraphQLNonNull(TeamMeetingSettings),
      description: 'The settings that contain the teamTemplates array that was modified',
      resolve: (
        {teamId, meetingType = 'retrospective'}: {teamId: string; meetingType: MeetingTypeEnum},
        _args,
        {dataLoader}
      ) => {
        return dataLoader.get('meetingSettingsByType').load({teamId, meetingType})
      }
    }
  })
})

const UpdateTemplateScopePayload = makeMutationPayload(
  'UpdateTemplateScopePayload',
  UpdateTemplateScopeSuccess
)

export default UpdateTemplateScopePayload
