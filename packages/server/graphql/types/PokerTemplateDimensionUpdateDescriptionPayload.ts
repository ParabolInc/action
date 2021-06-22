import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import TemplateDimension from './TemplateDimension'
import StandardMutationError from './StandardMutationError'

const PokerTemplateDimensionUpdateDescriptionPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerTemplateDimensionUpdateDescriptionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
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

export default PokerTemplateDimensionUpdateDescriptionPayload
