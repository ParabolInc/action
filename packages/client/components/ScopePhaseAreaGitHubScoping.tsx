import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ScopePhaseAreaGitHubScoping_meeting} from '../__generated__/ScopePhaseAreaGitHubScoping_meeting.graphql'
import GitHubScopingSearchBar from './GitHubScopingSearchBar'
import GitHubScopingSearchResultsRoot from './GitHubScopingSearchResultsRoot'
interface Props {
  meeting: ScopePhaseAreaGitHubScoping_meeting
}

const ScopePhaseAreaGitHubScoping = (props: Props) => {
  const {meeting} = props
  return (
    <>
      <GitHubScopingSearchBar meeting={meeting} />
      <GitHubScopingSearchResultsRoot meeting={meeting} />
    </>
  )
}

export default createFragmentContainer(ScopePhaseAreaGitHubScoping, {
  meeting: graphql`
    fragment ScopePhaseAreaGitHubScoping_meeting on PokerMeeting {
      ...GitHubScopingSearchBar_meeting
      ...GitHubScopingSearchResultsRoot_meeting
    }
  `
})
