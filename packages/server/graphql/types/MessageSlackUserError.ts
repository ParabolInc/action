import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'

export const MessageSlackUserError = new GraphQLObjectType({
  name: 'MessageSlackUserError',
  description: 'An error from sending a message to a Slack user',
  fields: () => ({
    userId: {
      type: GraphQLNonNull(GraphQLID)
    },
    error: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The error message received from Slack'
    }
  })
})

export default MessageSlackUserError
