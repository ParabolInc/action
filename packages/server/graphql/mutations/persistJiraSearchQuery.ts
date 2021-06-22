import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import JiraSearchQuery from '../../database/types/JiraSearchQuery'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import JiraSearchQueryInput from '../types/JiraSearchQueryInput'
import PersistJiraSearchQueryPayload from '../types/PersistJiraSearchQueryPayload'

const persistJiraSearchQuery = {
  type: GraphQLNonNull(PersistJiraSearchQueryPayload),
  description: `Add or remove a task and its estimate phase from the meeting`,
  args: {
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the team witht the settings we add the query to'
    },
    input: {
      type: GraphQLNonNull(JiraSearchQueryInput),
      description: 'the jira search query to persist (or remove, if isRemove is true)'
    }
  },
  resolve: async (
    _source,
    {teamId, input},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const MAX_QUERIES = 5
    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: `Not on team`}}
    }
    const atlassianAuth = await dataLoader
      .get('freshAtlassianAuth')
      .load({teamId, userId: viewerId})
    if (!atlassianAuth) {
      return {error: {message: 'Not integrated with Jira'}}
    }
    // MUTATIVE
    atlassianAuth.jiraSearchQueries = atlassianAuth.jiraSearchQueries || []
    const {queryString, isJQL, projectKeyFilters, isRemove} = input
    projectKeyFilters.sort()
    const {id: atlassianAuthId, jiraSearchQueries} = atlassianAuth
    const lookupKey = JSON.stringify({queryString, projectKeyFilters})
    const searchQueryStrings = jiraSearchQueries.map(({queryString, projectKeyFilters}) =>
      JSON.stringify({queryString, projectKeyFilters})
    )
    const existingIdx = searchQueryStrings.indexOf(lookupKey)
    let isChange = true
    if (existingIdx !== -1) {
      // the search query already exists
      // if remove, then delete it
      // if not, then update the lastUsedAt
      if (isRemove) {
        // MUTATIVE
        jiraSearchQueries.splice(existingIdx, 1)
      } else {
        const queryToUpdate = jiraSearchQueries[existingIdx]
        // MUTATIVE
        queryToUpdate.lastUsedAt = new Date()
        jiraSearchQueries.sort((a, b) => (a.lastUsedAt > b.lastUsedAt ? -1 : 1))
        if (jiraSearchQueries[existingIdx] === queryToUpdate) {
          isChange = false
        }
      }
    } else if (!isRemove) {
      const newQuery = new JiraSearchQuery({
        queryString,
        isJQL,
        projectKeyFilters
      })
      // MUTATIVE
      jiraSearchQueries.unshift(newQuery)
      jiraSearchQueries.slice(0, MAX_QUERIES)
    }
    const data = {atlassianAuthId}
    if (isChange) {
      await r
        .table('AtlassianAuth')
        .get(atlassianAuthId)
        .update({
          jiraSearchQueries
        })
        .run()
      publish(
        SubscriptionChannel.NOTIFICATION,
        viewerId,
        'PersistJiraSearchQuerySuccess',
        data,
        subOptions
      )
    }
    return data
  }
}

export default persistJiraSearchQuery
