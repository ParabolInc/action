import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const TaskEstimate = new GraphQLObjectType<any, GQLContext>({
  name: 'TaskEstimate',
  description: 'An estimate for a Task that was voted on and scored in a poker meeting',
  fields: () => ({
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The name of the estimate dimension'
    },
    label: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The human-readable label for the estimate'
    }
  })
})
export default TaskEstimate
