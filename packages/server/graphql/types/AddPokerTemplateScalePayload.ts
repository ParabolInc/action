import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import TemplateScale from './TemplateScale'
import StandardMutationError from './StandardMutationError'

const AddPokerTemplateScalePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddPokerTemplateScalePayload',
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

export default AddPokerTemplateScalePayload
