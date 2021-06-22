import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import MeetingTemplate from './MeetingTemplate'
import StandardMutationError from './StandardMutationError'

const RenameMeetingTemplatePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RenameMeetingTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meetingTemplate: {
      type: MeetingTemplate,
      resolve: ({templateId}, _args, {dataLoader}) => {
        if (!templateId) return null
        return dataLoader.get('meetingTemplates').load(templateId)
      }
    }
  })
})

export default RenameMeetingTemplatePayload
