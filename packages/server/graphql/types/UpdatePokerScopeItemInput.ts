import {GraphQLID, GraphQLInputObjectType, GraphQLNonNull} from 'graphql'
import AddOrDeleteEnum from './AddOrDeleteEnum'
import TaskServiceEnum from './TaskServiceEnum'

const UpdatePokerScopeItemInput = new GraphQLInputObjectType({
  name: 'UpdatePokerScopeItemInput',
  fields: () => ({
    service: {
      type: GraphQLNonNull(TaskServiceEnum),
      description: 'The service where the task comes from'
    },
    serviceTaskId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'A JSON commposite key used to fetch the task from the service'
    },
    action: {
      type: GraphQLNonNull(AddOrDeleteEnum),
      description: 'The action to perform'
    }
  })
})

export default UpdatePokerScopeItemInput
