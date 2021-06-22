import {Handler} from 'relay-runtime/lib/store/RelayStoreTypes'
import {TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import SearchQueryId from '../../shared/gqlIds/SearchQueryId'
import createProxyRecord from './createProxyRecord'

const defaults = [
  {
    service: 'jira',
    meetingPropName: 'jiraSearchQuery',
    type: 'JiraSearchQuery',
    defaultQuery: {
      queryString: '',
      projectKeyFilters: [],
      isJQL: false
    }
  },
  {
    service: 'PARABOL',
    meetingPropName: 'parabolSearchQuery',
    type: 'ParabolSearchQuery',
    defaultQuery: {
      queryString: '',
      statusFilters: ['active'] as TaskStatusEnum[]
    }
  },
  {
    service: 'github',
    meetingPropName: 'githubSearchQuery',
    type: 'GitHubSearchQuery',
    defaultQuery: {
      queryString: '',
      nameWithOwnerFilters: []
    }
  }
] as const

const initializeDefaultSearchQueries = (store, payload): void => {
  const meetingId = payload.dataID
  const meeting = store.get(meetingId)!
  defaults.forEach(({service, type, meetingPropName, defaultQuery}) => {
    const queryId = SearchQueryId.join(service, meetingId)
    const existingQuery = store.get(queryId)
    if (existingQuery) return
    const newQuery = createProxyRecord(store, type, {
      id: queryId,
      ...defaultQuery
    })
    meeting.setLinkedRecord(newQuery, meetingPropName)
  })
}

const LocalPokerHandler: Handler = {
  update(store, payload) {
    initializeDefaultSearchQueries(store, payload)
  }
}

export default LocalPokerHandler
