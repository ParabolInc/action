import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import ReflectTemplate from './ReflectTemplate'
import StandardMutationError from './StandardMutationError'

const AddReflectTemplatePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddReflectTemplatePayload',
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
    }
  })
})

export default AddReflectTemplatePayload
