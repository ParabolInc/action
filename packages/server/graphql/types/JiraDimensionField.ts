import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import JiraDimensionFieldId from '../../../client/shared/gqlIds/JiraDimensionFieldId'
import {GQLContext} from '../graphql'

const JiraDimensionField = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraDimensionField',
  description: 'Poker dimensions mapped to their corresponding fields in jira',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: ({cloudId, dimensionName, fieldId}) =>
        JiraDimensionFieldId.join(cloudId, dimensionName, fieldId)
    },
    cloudId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The atlassian cloud that the field lives in'
    },
    dimensionName: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The name of the associated dimension'
    },
    projectKey: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The project under the atlassian cloud the field lives in'
    },
    fieldId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The ID referring to the field name'
    },
    fieldName: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The field name in jira that the estimate is pushed to'
    },
    fieldType: {
      type: GraphQLNonNull(GraphQLString),
      description: 'the type of field, e.g. number, string, any'
    }
  })
})

export default JiraDimensionField
