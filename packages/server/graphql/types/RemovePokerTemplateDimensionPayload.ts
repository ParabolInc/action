import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import PokerTemplate from './PokerTemplate'
import TemplateDimension from './TemplateDimension'
import StandardMutationError from './StandardMutationError'

const RemovePokerTemplateDimensionPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemovePokerTemplateDimensionPayload',
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
    },
    dimension: {
      type: TemplateDimension,
      resolve: ({dimensionId}, _args, {dataLoader}) => {
        if (!dimensionId) return null
        return dataLoader.get('templateDimensions').load(dimensionId)
      }
    }
  })
})

export default RemovePokerTemplateDimensionPayload
