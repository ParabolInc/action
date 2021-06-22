import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import TaskStatusEnum from './TaskStatusEnum'
import ThreadSourceEnum from './ThreadSourceEnum'

const CreateTaskInput = new GraphQLInputObjectType({
  name: 'CreateTaskInput',
  fields: () => ({
    content: {
      type: GraphQLString
    },
    plaintextContent: {
      type: GraphQLString
    },
    meetingId: {
      type: GraphQLID,
      description: 'foreign key for the meeting this was created in'
    },
    threadId: {
      type: GraphQLID,
      description: 'foreign key for the reflection group or agenda item this was created from'
    },
    threadSource: {
      type: ThreadSourceEnum
    },
    threadSortOrder: {
      type: GraphQLFloat
    },
    threadParentId: {
      type: GraphQLID
    },
    sortOrder: {
      type: GraphQLFloat
    },
    status: {
      type: new GraphQLNonNull(TaskStatusEnum)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'teamId, the team the task is on'
    },
    userId: {
      type: GraphQLID,
      description:
        'userId, the owner of the task. This can be null if the task is not assigned to anyone.'
    }
  })
})

export default CreateTaskInput
