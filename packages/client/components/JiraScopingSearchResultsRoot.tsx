import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer, QueryRenderer} from 'react-relay'
import {JiraScopingSearchResultsRootQuery} from '~/__generated__/JiraScopingSearchResultsRootQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {JiraScopingSearchResultsRoot_meeting} from '../__generated__/JiraScopingSearchResultsRoot_meeting.graphql'
import ErrorComponent from './ErrorComponent/ErrorComponent'
import JiraScopingSearchResults from './JiraScopingSearchResults'

const query = graphql`
  query JiraScopingSearchResultsRootQuery(
    $teamId: ID!
    $queryString: String
    $isJQL: Boolean!
    $projectKeyFilters: [ID!]
    $first: Int
  ) {
    viewer {
      ...JiraScopingSearchResults_viewer
    }
  }
`

interface Props {
  meeting: JiraScopingSearchResultsRoot_meeting
}

const JiraScopingSearchResultsRoot = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {meeting} = props
  const {teamId, jiraSearchQuery} = meeting
  const {queryString, projectKeyFilters, isJQL} = jiraSearchQuery
  const normalizedQueryString = queryString.trim()

  return (
    <QueryRenderer<JiraScopingSearchResultsRootQuery>
      environment={atmosphere}
      query={query}
      variables={{
        teamId,
        queryString: normalizedQueryString,
        isJQL,
        projectKeyFilters: projectKeyFilters as string[],
        first: 100
      }}
      fetchPolicy={'store-or-network' as any}
      render={({props, error}) => {
        const viewer = props?.viewer ?? null
        if (error) return <ErrorComponent error={error} eventId={''} />
        return <JiraScopingSearchResults viewer={viewer} meeting={meeting} />
      }}
    />
  )
}

export default createFragmentContainer(JiraScopingSearchResultsRoot, {
  meeting: graphql`
    fragment JiraScopingSearchResultsRoot_meeting on PokerMeeting {
      ...JiraScopingSearchResults_meeting
      teamId
      jiraSearchQuery {
        queryString
        projectKeyFilters
        isJQL
      }
    }
  `
})
