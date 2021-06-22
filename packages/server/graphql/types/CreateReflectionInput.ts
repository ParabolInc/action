import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'

const CreateReflectionInput = new GraphQLInputObjectType({
  name: 'CreateReflectionInput',
  fields: () => ({
    content: {
      type: GraphQLString,
      description: 'A stringified draft-js document containing thoughts'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    promptId: {
      type: GraphQLID,
      description: 'The prompt the reflection belongs to'
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat)
    }
  })
})

export default CreateReflectionInput
