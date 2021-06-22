import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {JiraScopingSearchBar_meeting} from '../__generated__/JiraScopingSearchBar_meeting.graphql'
import JiraScopingSearchHistoryToggle from './JiraScopingSearchHistoryToggle'
import JiraScopingSearchInput from './JiraScopingSearchInput'
import JiraScopingSearchFilterToggle from './JiraScopingSearchFilterToggle'
import React from 'react'
import styled from '@emotion/styled'

const SearchBar = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: 16
})
interface Props {
  meeting: JiraScopingSearchBar_meeting
}

const JiraScopingSearchBar = (props: Props) => {
  const {meeting} = props
  return (
    <SearchBar>
      <JiraScopingSearchHistoryToggle meeting={meeting} />
      <JiraScopingSearchInput meeting={meeting} />
      <JiraScopingSearchFilterToggle meeting={meeting} />
    </SearchBar>
  )
}

export default createFragmentContainer(JiraScopingSearchBar, {
  meeting: graphql`
    fragment JiraScopingSearchBar_meeting on PokerMeeting {
      ...JiraScopingSearchHistoryToggle_meeting
      ...JiraScopingSearchInput_meeting
      ...JiraScopingSearchFilterToggle_meeting
    }
  `
})
