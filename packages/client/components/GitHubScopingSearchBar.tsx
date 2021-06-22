import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {GitHubScopingSearchBar_meeting} from '../__generated__/GitHubScopingSearchBar_meeting.graphql'
import GitHubScopingSearchFilterToggle from './GitHubScopingSearchFilterToggle'
import GitHubScopingSearchHistoryToggle from './GitHubScopingSearchHistoryToggle'
import GitHubScopingSearchInput from './GitHubScopingSearchInput'

const SearchBar = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: 16
})
interface Props {
  meeting: GitHubScopingSearchBar_meeting
}

const GitHubScopingSearchBar = (props: Props) => {
  const {meeting} = props
  return (
    <SearchBar>
      <GitHubScopingSearchHistoryToggle meeting={meeting} />
      <GitHubScopingSearchInput meeting={meeting} />
      <GitHubScopingSearchFilterToggle />
    </SearchBar>
  )
}

export default createFragmentContainer(GitHubScopingSearchBar, {
  meeting: graphql`
    fragment GitHubScopingSearchBar_meeting on PokerMeeting {
      ...GitHubScopingSearchHistoryToggle_meeting
      ...GitHubScopingSearchInput_meeting
      ...GitHubScopingSearchFilterToggle_meeting
    }
  `
})
