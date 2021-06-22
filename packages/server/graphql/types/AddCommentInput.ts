import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean
} from 'graphql'
import ThreadSourceEnum from './ThreadSourceEnum'

const AddCommentInput = new GraphQLInputObjectType({
  name: 'AddCommentInput',
  fields: () => ({
    content: {
      type: GraphQLNonNull(GraphQLString),
      description: 'A stringified draft-js document containing thoughts'
    },
    isAnonymous: {
      type: GraphQLBoolean,
      description: 'true if the comment should be anonymous'
    },
    threadId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'foreign key for the reflection group or agenda item this was created from'
    },
    threadSource: {
      type: GraphQLNonNull(ThreadSourceEnum)
    },
    threadSortOrder: {
      type: GraphQLNonNull(GraphQLFloat)
    },
    threadParentId: {
      type: GraphQLID
    }
  })
})

export default AddCommentInput
