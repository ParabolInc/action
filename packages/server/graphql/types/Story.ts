import {GraphQLID, GraphQLNonNull, GraphQLList, GraphQLInterfaceType, GraphQLString} from 'graphql'
import ThreadSource, {threadSourceFields} from './ThreadSource'
import CommentorDetails from './CommentorDetails'

export const storyFields = () => ({
  ...threadSourceFields(),
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'serviceTaskId'
  },
  commentors: {
    type: new GraphQLList(new GraphQLNonNull(CommentorDetails)),
    description: 'A list of users currently commenting',
    resolve: ({commentors = []}) => {
      return commentors
    }
  },
  title: {
    type: GraphQLNonNull(GraphQLString),
    description: 'The title, independent of the story type'
  }
})

const Story = new GraphQLInterfaceType({
  name: 'Story',
  description: 'An entity that can be used in a poker meeting and receive estimates',
  interfaces: () => [ThreadSource],
  fields: () => ({
    ...storyFields()
  })
})

export default Story
