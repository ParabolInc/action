import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {JiraScopingSearchHistoryToggle_meeting} from '../__generated__/JiraScopingSearchHistoryToggle_meeting.graphql'
import Icon from './Icon'
import JiraScopingSearchHistoryMenu from './JiraScopingSearchHistoryMenu'
import PlainButton from './PlainButton/PlainButton'

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24
})

const DropdownIcon = styled(Icon)({
  color: PALETTE.SLATE_700,
  fontSize: ICON_SIZE.MD18,
  marginLeft: -8
})

const Toggle = styled(PlainButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingRight: 8
})
interface Props {
  meeting: JiraScopingSearchHistoryToggle_meeting
}

const JiraScopingSearchHistoryToggle = (props: Props) => {
  const {meeting} = props
  const {id: meetingId, viewerMeetingMember} = meeting
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_LEFT, {
    loadingWidth: 200,
    noClose: true
  })
  if (!viewerMeetingMember) return null
  const {teamMember} = viewerMeetingMember
  return (
    <>
      <Toggle onClick={togglePortal} ref={originRef}>
        <SearchIcon>search</SearchIcon>
        <DropdownIcon>expand_more</DropdownIcon>
      </Toggle>
      {menuPortal(
        <JiraScopingSearchHistoryMenu
          meetingId={meetingId}
          menuProps={menuProps}
          teamMember={teamMember}
        />
      )}
    </>
  )
}

export default createFragmentContainer(JiraScopingSearchHistoryToggle, {
  meeting: graphql`
    fragment JiraScopingSearchHistoryToggle_meeting on PokerMeeting {
      id
      teamId
      viewerMeetingMember {
        teamMember {
          ...JiraScopingSearchHistoryMenu_teamMember
        }
      }
    }
  `
})
