import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import TemplateScale from './TemplateScale'
import makeMutationPayload from './makeMutationPayload'

export const MovePokerTemplateScaleValueSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'MovePokerTemplateScaleValueSuccess',
  fields: () => ({
    scale: {
      type: new GraphQLNonNull(TemplateScale),
      description: 'The scale after values are moved',
      resolve: ({scaleId}, _args, {dataLoader}) => {
        if (!scaleId) return null
        return dataLoader.get('templateScales').load(scaleId)
      }
    }
  })
})

const MovePokerTemplateScaleValuePayload = makeMutationPayload(
  'MovePokerTemplateScaleValuePayload',
  MovePokerTemplateScaleValueSuccess
)

export default MovePokerTemplateScaleValuePayload
