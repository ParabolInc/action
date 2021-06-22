import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const TemplateScaleValue = new GraphQLObjectType<any, GQLContext>({
  name: 'TemplateScaleValue',
  description: 'A value for a scale.',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      resolve: ({scaleId, label}) => {
        return `${scaleId}:${label}`
      }
    },
    scaleId: {
      description: 'The id of the scale this value belongs to',
      type: GraphQLNonNull(GraphQLID)
    },
    color: {
      description: 'The color used to visually group a scale value',
      type: new GraphQLNonNull(GraphQLString)
    },
    label: {
      description: 'The label for this value, e.g., XS, M, L',
      type: new GraphQLNonNull(GraphQLString)
    },

    sortOrder: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'the order of the scale value in this scale'
    }
  })
})

export default TemplateScaleValue
