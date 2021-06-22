import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer, QueryRenderer} from 'react-relay'
import {GitHubScopingSearchResultsRootQuery} from '~/__generated__/GitHubScopingSearchResultsRootQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {GitHubScopingSearchResultsRoot_meeting} from '../__generated__/GitHubScopingSearchResultsRoot_meeting.graphql'
import ErrorComponent from './ErrorComponent/ErrorComponent'
import GitHubScopingSearchResults from './GitHubScopingSearchResults'

const query = graphql`
  query GitHubScopingSearchResultsRootQuery(
    $teamId: ID!
    $queryString: String
    $nameWithOwnerFilters: [ID!]
    $first: Int
  ) {
    viewer {
      ...GitHubScopingSearchResults_viewer
    }
  }
`

interface Props {
  meeting: GitHubScopingSearchResultsRoot_meeting
}

const GitHubScopingSearchResultsRoot = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {meeting} = props
  const {teamId, githubSearchQuery} = meeting
  const {queryString, nameWithOwnerFilters} = githubSearchQuery
  const normalizedQueryString = queryString.trim()

  return (
    <QueryRenderer<GitHubScopingSearchResultsRootQuery>
      environment={atmosphere}
      query={query}
      variables={{
        teamId,
        queryString: normalizedQueryString,
        nameWithOwnerFilters: nameWithOwnerFilters as string[],
        first: 100
      }}
      fetchPolicy={'store-or-network' as any}
      render={({props, error}) => {
        const viewer = props?.viewer ?? null
        if (error) return <ErrorComponent error={error} eventId={''} />
        return <GitHubScopingSearchResults viewer={viewer} meeting={meeting} />
      }}
    />
  )
}

export default createFragmentContainer(GitHubScopingSearchResultsRoot, {
  meeting: graphql`
    fragment GitHubScopingSearchResultsRoot_meeting on PokerMeeting {
      ...GitHubScopingSearchResults_meeting
      teamId
      githubSearchQuery {
        queryString
        nameWithOwnerFilters
      }
    }
  `
})
