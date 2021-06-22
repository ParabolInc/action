import {GraphQLEnumType} from 'graphql'

const ThreadSourceEnum = new GraphQLEnumType({
  name: 'ThreadSourceEnum',
  description: 'The source of the thread',
  values: {
    AGENDA_ITEM: {},
    REFLECTION_GROUP: {},
    STORY: {}
  }
})

export default ThreadSourceEnum
