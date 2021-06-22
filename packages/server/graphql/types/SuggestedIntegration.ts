import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import SuggestedIntegrationGitHub from './SuggestedIntegrationGitHub'
import SuggestedIntegrationJira from './SuggestedIntegrationJira'
import TaskServiceEnum from './TaskServiceEnum'

export const suggestedIntegrationFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    resolve: ({id}) => {
      return `sa:${id}`
    }
  },
  service: {
    type: new GraphQLNonNull(TaskServiceEnum)
  }
})

const resolveTypeLookup = {
  github: SuggestedIntegrationGitHub,
  jira: SuggestedIntegrationJira
}

const SuggestedIntegration = new GraphQLInterfaceType({
  name: 'SuggestedIntegration',
  fields: suggestedIntegrationFields,
  resolveType(value) {
    return resolveTypeLookup[value.service]
  }
})

export default SuggestedIntegration
