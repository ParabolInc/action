import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import TemplateScale from './TemplateScale'
import StandardMutationError from './StandardMutationError'

const UpdatePokerTemplateScaleValuePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdatePokerTemplateScaleValuePayload',
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

export default UpdatePokerTemplateScaleValuePayload
