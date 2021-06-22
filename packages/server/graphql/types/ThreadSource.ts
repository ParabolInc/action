import {GraphQLID, GraphQLNonNull, GraphQLInt, GraphQLString, GraphQLInterfaceType} from 'graphql'
import {ThreadableConnection} from './Threadable'
import resolveThread from '../resolvers/resolveThread'
import RetroReflectionGroup from './RetroReflectionGroup'
import AgendaItem from './AgendaItem'
import Story from './Story'
import getThreadSourceType from './getThreadSourceType'

export const threadSourceFields = () => ({
  id: {
    type: GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  thread: {
    type: GraphQLNonNull(ThreadableConnection),
    args: {
      first: {
        type: GraphQLNonNull(GraphQLInt)
      },
      after: {
        type: GraphQLString,
        description: 'the incrementing sort order in string format'
      }
    },
    description: 'the comments and tasks created from the discussion',
    resolve: resolveThread
  }
})

const ThreadSource = new GraphQLInterfaceType({
  name: 'ThreadSource',
  description: 'The source of a discusson thread',
  fields: threadSourceFields,
  resolveType: (type) => {
    const threadSourceType = getThreadSourceType(type)
    const lookup = {
      REFLECTION_GROUP: RetroReflectionGroup,
      AGENDA_ITEM: AgendaItem,
      STORY: Story
    } as const
    return lookup[threadSourceType]
  }
})

export default ThreadSource
