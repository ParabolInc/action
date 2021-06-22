import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import PokerTemplate from './PokerTemplate'
import StandardMutationError from './StandardMutationError'

const RenamePokerTemplatePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RenamePokerTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    pokerTemplate: {
      type: PokerTemplate,
      resolve: ({templateId}, _args, {dataLoader}) => {
        if (!templateId) return null
        return dataLoader.get('meetingTemplates').load(templateId)
      }
    }
  })
})

export default RenamePokerTemplatePayload
