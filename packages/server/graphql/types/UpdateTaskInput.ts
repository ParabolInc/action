import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql'
import TaskStatusEnum from './TaskStatusEnum'

const UpdateTaskInput = new GraphQLInputObjectType({
  name: 'UpdateTaskInput',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The task id'
    },
    content: {type: GraphQLString},
    sortOrder: {type: GraphQLFloat},
    status: {type: TaskStatusEnum},
    teamId: {type: GraphQLID},
    userId: {
      type: GraphQLID,
      description:
        'userId, the owner of the task. This can be null if the task is not assigned to anyone.'
    }
  })
})

export default UpdateTaskInput
