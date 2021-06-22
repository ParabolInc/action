import {GraphQLEnumType} from 'graphql'

const TaskServiceEnum = new GraphQLEnumType({
  name: 'TaskServiceEnum',
  description: 'The list of services for task integrations',
  values: {
    github: {},
    jira: {},
    PARABOL: {}
  }
})

export default TaskServiceEnum
