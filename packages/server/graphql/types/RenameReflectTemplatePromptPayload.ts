import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import ReflectPrompt from './ReflectPrompt'
import StandardMutationError from './StandardMutationError'

const RenameReflectTemplatePromptPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RenameReflectTemplatePromptPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    prompt: {
      type: ReflectPrompt,
      resolve: ({promptId}, _args, {dataLoader}) => {
        if (!promptId) return null
        return dataLoader.get('reflectPrompts').load(promptId)
      }
    }
  })
})

export default RenameReflectTemplatePromptPayload
