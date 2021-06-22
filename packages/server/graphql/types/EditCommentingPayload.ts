import {GraphQLBoolean, GraphQLObjectType, GraphQLID, GraphQLNonNull} from 'graphql'
import {GQLContext} from '../graphql'
import User from './User'

const EditCommentingPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'EditCommentingPayload',
  fields: () => ({
    isCommenting: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user is commenting, false if the user has stopped commenting'
    },
    commentor: {
      type: User,
      description: 'The user that is commenting or has stopped commenting',
      resolve: ({commentorId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(commentorId)
      }
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    threadId: {
      type: GraphQLNonNull(GraphQLID)
    }
  })
})

export default EditCommentingPayload
