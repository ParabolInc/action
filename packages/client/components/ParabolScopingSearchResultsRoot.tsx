import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer, QueryRenderer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import ParabolScopingSearchResults from './ParabolScopingSearchResults'
import {ParabolScopingSearchResultsRoot_meeting} from '../__generated__/ParabolScopingSearchResultsRoot_meeting.graphql'
import ErrorComponent from './ErrorComponent/ErrorComponent'
import {ParabolScopingSearchResultsRootQuery} from '../__generated__/ParabolScopingSearchResultsRootQuery.graphql'
import {ParabolSearchQuery} from '~/types/clientSchema'
import {taskScopingStatusFilters} from '~/utils/constants'

const query = graphql`
  query ParabolScopingSearchResultsRootQuery(
    $first: Int!
    $after: DateTime
    $userIds: [ID!]
    $teamIds: [ID!]
    $statusFilters: [TaskStatusEnum!]
    $filterQuery: String
  ) {
    viewer {
      ...ParabolScopingSearchResults_viewer
    }
  }
`

interface Props {
  meeting: ParabolScopingSearchResultsRoot_meeting
}

const ParabolScopingSearchResultsRoot = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {meeting} = props
  const {teamId, parabolSearchQuery} = meeting
  const {queryString, statusFilters} = parabolSearchQuery as unknown as ParabolSearchQuery
  return (
    <QueryRenderer<ParabolScopingSearchResultsRootQuery>
      environment={atmosphere}
      query={query}
      variables={{
        first: 50,
        teamIds: [teamId],
        userIds: [],
        statusFilters: (statusFilters?.length && statusFilters) || taskScopingStatusFilters,
        filterQuery: queryString!.trim()
      }}
      fetchPolicy={'store-or-network' as any}
      render={({props, error}) => {
        const viewer = (props as any)?.viewer ?? null
        if (error) return <ErrorComponent error={error} eventId={''} />
        return <ParabolScopingSearchResults viewer={viewer} meeting={meeting} />
      }}
    />
  )
}

export default createFragmentContainer(ParabolScopingSearchResultsRoot, {
  meeting: graphql`
    fragment ParabolScopingSearchResultsRoot_meeting on PokerMeeting {
      ...ParabolScopingSearchResults_meeting
      parabolSearchQuery {
        queryString
        statusFilters
      }
      teamId
    }
  `
})
