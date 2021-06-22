import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import Team from './Team'
import TemplateDimension from './TemplateDimension'
import TemplateScaleValue from './TemplateScaleValue'

const TemplateScale = new GraphQLObjectType<any, GQLContext>({
  name: 'TemplateScale',
  description: 'A team-specific template scale.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type)
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({removedAt}) => !removedAt,
      description: 'true if the scale is currently used by the team, else false'
    },
    isStarter: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({isStarter}) => !!isStarter,
      description: 'True if this is a starter/default scale; false otherwise'
    },
    removedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime that the scale was removed. Null if it has not been removed.'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'foreign key. use the team field'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team that owns this template scale',
      resolve: resolveTeam
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the scale used in the template'
    },
    dimensions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TemplateDimension))),
      description: 'The dimensions currently using this scale',
      resolve: async ({id: scaleId, teamId}) => {
        const r = await getRethink()
        return r
          .table('TemplateDimension')
          .getAll(teamId, {index: 'teamId'})
          .filter((row) =>
            row('removedAt')
              .default(null)
              .eq(null)
              .and(row('scaleId').eq(scaleId))
          )
          .run()
      }
    },
    values: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TemplateScaleValue))),
      description: 'The values used in this scale',
      resolve: ({id, values}) => {
        return values.map((value, index) => ({
          ...value,
          scaleId: id,
          sortOrder: index
        }))
      }
    }
  })
})

export default TemplateScale
