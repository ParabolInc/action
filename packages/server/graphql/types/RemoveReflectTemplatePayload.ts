import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import ReflectTemplate from './ReflectTemplate'
import RetrospectiveMeetingSettings from './RetrospectiveMeetingSettings'
import StandardMutationError from './StandardMutationError'

const RemoveReflectTemplatePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveReflectTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    reflectTemplate: {
      type: ReflectTemplate,
      resolve: ({templateId}, _args, {dataLoader}) => {
        if (!templateId) return null
        return dataLoader.get('meetingTemplates').load(templateId)
      }
    },
    retroMeetingSettings: {
      type: RetrospectiveMeetingSettings,
      resolve: ({settingsId}, _args, {dataLoader}) => {
        if (!settingsId) return null
        return dataLoader.get('meetingSettings').load(settingsId)
      }
    }
  })
})

export default RemoveReflectTemplatePayload
