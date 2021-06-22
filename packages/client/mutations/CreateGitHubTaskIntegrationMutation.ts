import {CreateGitHubTaskIntegrationMutation as TCreateGitHubTaskIntegrationMutation} from '../__generated__/CreateGitHubTaskIntegrationMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'

graphql`
  fragment CreateGitHubTaskIntegrationMutation_task on CreateGitHubTaskIntegrationPayload {
    task {
      integration {
        ... on TaskIntegrationGitHub {
          issueNumber
          service
          nameWithOwner
        }
        ...TaskIntegrationLinkIntegrationGitHub
      }
      updatedAt
    }
  }
`

const mutation = graphql`
  mutation CreateGitHubTaskIntegrationMutation($nameWithOwner: String!, $taskId: ID!) {
    createGitHubTaskIntegration(nameWithOwner: $nameWithOwner, taskId: $taskId) {
      error {
        message
      }
      ...CreateGitHubTaskIntegrationMutation_task @relay(mask: false)
    }
  }
`

const CreateGitHubTaskIntegrationMutation: StandardMutation<TCreateGitHubTaskIntegrationMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TCreateGitHubTaskIntegrationMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {nameWithOwner, taskId} = variables
      const now = new Date()
      const task = store.get(taskId)
      if (!task) return
      const optimisticIntegration = {
        service: 'github',
        nameWithOwner,
        issueNumber: '?',
        updatedAt: now.toJSON()
      } as const
      const integration = createProxyRecord(store, 'TaskIntegrationGitHub', optimisticIntegration)
      task.setLinkedRecord(integration, 'integration')
    },
    onCompleted,
    onError
  })
}

export default CreateGitHubTaskIntegrationMutation
