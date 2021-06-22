import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import Atmosphere from '../Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'
import {ParabolScopingSearchInput_meeting} from '../__generated__/ParabolScopingSearchInput_meeting.graphql'
import Icon from './Icon'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1
})

const SearchInput = styled('input')({
  appearance: 'none',
  border: '1px solid transparent',
  color: PALETTE.SLATE_700,
  fontSize: 16,
  margin: 0,
  outline: 0,
  backgroundColor: 'transparent',
  width: '100%'
})

const ClearSearchIcon = styled(Icon)<{isEmpty: boolean}>(({isEmpty}) => ({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  padding: 12,
  visibility: isEmpty ? 'hidden' : undefined
}))

const setSearch = (atmosphere: Atmosphere, meetingId: string, value: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const meeting = store.get(meetingId)
    if (!meeting) return
    const parabolSearchQuery = meeting.getLinkedRecord('parabolSearchQuery')!
    parabolSearchQuery.setValue(value, 'queryString')
  })
}

interface Props {
  meeting: ParabolScopingSearchInput_meeting
}

const ParabolScopingSearchInput = (props: Props) => {
  const {meeting} = props
  const {id: meetingId, parabolSearchQuery} = meeting
  const {queryString} = parabolSearchQuery
  const isEmpty = !queryString
  const atmosphere = useAtmosphere()
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(atmosphere, meetingId, e.target.value)
  }
  const clearSearch = () => setSearch(atmosphere, meetingId, '')
  return (
    <Wrapper>
      <SearchInput value={queryString!} placeholder={'Search Parabol tasks'} onChange={onChange} />
      <ClearSearchIcon isEmpty={isEmpty} onClick={clearSearch}>
        close
      </ClearSearchIcon>
    </Wrapper>
  )
}

export default createFragmentContainer(ParabolScopingSearchInput, {
  meeting: graphql`
    fragment ParabolScopingSearchInput_meeting on PokerMeeting {
      id
      parabolSearchQuery {
        queryString
      }
    }
  `
})
