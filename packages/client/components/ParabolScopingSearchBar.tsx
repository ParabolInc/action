import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ParabolScopingSearchBar_meeting} from '../__generated__/ParabolScopingSearchBar_meeting.graphql'
import ParabolScopingSearchInput from './ParabolScopingSearchInput'
import ParabolScopingSearchFilterToggle from './ParabolScopingSearchFilterToggle'
import styled from '@emotion/styled'
import Icon from './Icon'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  marginRight: 12,
})

const SearchBar = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: 16
})

interface Props {
  meeting: ParabolScopingSearchBar_meeting
}

const ParabolScopingSearchBar = (props: Props) => {
  const {meeting} = props
  return (
    <SearchBar>
      <SearchIcon>search</SearchIcon>
      <ParabolScopingSearchInput meeting={meeting} />
      <ParabolScopingSearchFilterToggle meeting={meeting} />
    </SearchBar>
  )
}

export default createFragmentContainer(ParabolScopingSearchBar, {
  meeting: graphql`
    fragment ParabolScopingSearchBar_meeting on PokerMeeting {
      ...ParabolScopingSearchInput_meeting
      ...ParabolScopingSearchFilterToggle_meeting
    }
  `
})
