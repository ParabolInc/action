import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import TemplateScale from './TemplateScale'
import StandardMutationError from './StandardMutationError'

const RemovePokerTemplateScaleValuePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemovePokerTemplateScaleValuePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    scale: {
      type: TemplateScale,
      resolve: ({scaleId}, _args, {dataLoader}) => {
        if (!scaleId) return null
        return dataLoader.get('templateScales').load(scaleId)
      }
    }
  })
})

export default RemovePokerTemplateScaleValuePayload
