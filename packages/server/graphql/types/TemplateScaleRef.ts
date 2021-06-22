import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import TemplateScaleValue from './TemplateScaleValue'

const TemplateScaleRef = new GraphQLObjectType<any, GQLContext>({
  name: 'TemplateScaleRef',
  description: 'An immutable version of TemplateScale to be shared across all users',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'md5 hash'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the scale used in the template'
    },
    values: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TemplateScaleValue))),
      description: 'The values used in this scale',
      resolve: ({id, values}) => {
        return values.map(({color, label}, index) => ({
          color,
          label,
          scaleId: id,
          sortOrder: index
        }))
      }
    }
  })
})

export default TemplateScaleRef
