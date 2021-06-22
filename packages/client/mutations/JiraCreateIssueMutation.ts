import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import {JiraCreateIssueMutation_meeting} from '~/__generated__/JiraCreateIssueMutation_meeting.graphql'
import handleJiraCreateIssue from './handlers/handleJiraCreateIssue'
import {JiraCreateIssueMutation as TJiraCreateIssueMutation} from '~/__generated__/JiraCreateIssueMutation.graphql'
import UpdatePokerScopeMutation from './UpdatePokerScopeMutation'
import createProxyRecord from '~/utils/relay/createProxyRecord'
import {UpdatePokerScopeMutationVariables} from '../__generated__/UpdatePokerScopeMutation.graphql'

graphql`
  fragment JiraCreateIssueMutation_meeting on JiraCreateIssuePayload {
    jiraIssue {
      id
      cloudId
      key
      summary
      title
      descriptionHTML
      url
    }
    meetingId
    teamId
  }
`

const mutation = graphql`
  mutation JiraCreateIssueMutation(
    $cloudId: ID!
    $projectKey: ID!
    $summary: String!
    $teamId: ID!
    $meetingId: ID
  ) {
    jiraCreateIssue(
      cloudId: $cloudId
      projectKey: $projectKey
      summary: $summary
      teamId: $teamId
      meetingId: $meetingId
    ) {
      error {
        message
      }
      ...JiraCreateIssueMutation_meeting @relay(mask: false)
    }
  }
`
export const jiraCreateIssueUpdater: SharedUpdater<JiraCreateIssueMutation_meeting> = (
  payload,
  {store}
) => {
  handleJiraCreateIssue(payload, store)
}

const JiraCreateIssueMutation: StandardMutation<TJiraCreateIssueMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  return commitMutation<TJiraCreateIssueMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('jiraCreateIssue')
      if (!payload) return
      const context = {atmosphere, store}
      jiraCreateIssueUpdater(payload, context)
    },
    optimisticUpdater: (store) => {
      const {cloudId, teamId, meetingId, projectKey, summary} = variables
      const optimisticJiraIssue = createProxyRecord(store, 'JiraIssue', {
        cloudId,
        url: '',
        key: `${projectKey}-?`,
        summary,
        title: summary,
        descriptionHTML: ''
      })
      const payload = createProxyRecord(store, 'payload', {})
      payload.setLinkedRecord(optimisticJiraIssue, 'jiraIssue')
      payload.setValue(teamId, 'teamId')
      payload.setValue(meetingId, 'meetingId')
      handleJiraCreateIssue(payload, store)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      const payload = res.jiraCreateIssue
      if (!payload || !onCompleted || !onError) return
      const {meetingId, jiraIssue} = payload
      if (!meetingId) return
      const {id: jiraIssueId} = jiraIssue!
      const pokerScopeVariables = {
        meetingId,
        updates: [
          {
            service: 'jira',
            serviceTaskId: jiraIssueId,
            action: 'ADD'
          }
        ]
      } as UpdatePokerScopeMutationVariables
      UpdatePokerScopeMutation(atmosphere, pokerScopeVariables, {onError, onCompleted})
    },
    onError
  })
}

export default JiraCreateIssueMutation
