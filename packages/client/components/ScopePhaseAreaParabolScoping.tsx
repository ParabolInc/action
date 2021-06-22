import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ScopePhaseAreaParabolScoping_meeting} from '../__generated__/ScopePhaseAreaParabolScoping_meeting.graphql'
import ParabolScopingSearchBar from './ParabolScopingSearchBar'
import ParabolScopingSearchResultsRoot from './ParabolScopingSearchResultsRoot'

interface Props {
  isActive: boolean
  meeting: ScopePhaseAreaParabolScoping_meeting
}

const ScopePhaseAreaParabolScoping = (props: Props) => {
  const {isActive, meeting} = props
  if (!isActive) return null
  return (
    <>
      <ParabolScopingSearchBar meeting={meeting} />
      <ParabolScopingSearchResultsRoot meeting={meeting} />
    </>
  )
}

export default createFragmentContainer(ScopePhaseAreaParabolScoping, {
  meeting: graphql`
    fragment ScopePhaseAreaParabolScoping_meeting on PokerMeeting {
      ...ParabolScopingSearchBar_meeting
      ...ParabolScopingSearchResultsRoot_meeting
    }
  `
})
