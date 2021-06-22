import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const CommentorDetails = new GraphQLObjectType<any, GQLContext>({
  name: 'CommentorDetails',
  description: 'The user that is commenting',
  fields: () => ({
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId of the person commenting'
    },
    preferredName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The preferred name of the user commenting'
    }
  })
})

export default CommentorDetails
