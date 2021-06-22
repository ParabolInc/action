import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {PersistJiraSearchQueryMutation as TPersistJiraSearchQueryMutation} from '../__generated__/PersistJiraSearchQueryMutation.graphql'

graphql`
  fragment PersistJiraSearchQueryMutation_notification on PersistJiraSearchQuerySuccess {
    atlassianIntegration {
      jiraSearchQueries {
        id
        queryString
        isJQL
        projectKeyFilters
        lastUsedAt
      }
    }
  }
`

const mutation = graphql`
  mutation PersistJiraSearchQueryMutation($teamId: ID!, $input: JiraSearchQueryInput!) {
    persistJiraSearchQuery(teamId: $teamId, input: $input) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...PersistJiraSearchQueryMutation_notification @relay(mask: false)
    }
  }
`

const PersistJiraSearchQueryMutation: SimpleMutation<TPersistJiraSearchQueryMutation> = (
  atmosphere,
  variables,
) => {
  return commitMutation<TPersistJiraSearchQueryMutation>(atmosphere, {
    mutation,
    variables,
    // TODO: Add optimistic updater
    // optimisticUpdater: (store) => {
    // },
  })
}

export default PersistJiraSearchQueryMutation
