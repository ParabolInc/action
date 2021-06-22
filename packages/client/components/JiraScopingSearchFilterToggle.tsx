import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {JiraScopingSearchFilterToggle_meeting} from '../__generated__/JiraScopingSearchFilterToggle_meeting.graphql'
import React from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import PlainButton from './PlainButton/PlainButton'
import useMenu from '../hooks/useMenu'
import {MenuPosition} from '../hooks/useCoords'
import lazyPreload from '../utils/lazyPreload'

const FilterIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24
})

const JiraScopingSearchFilterMenuRoot = lazyPreload(() =>
  import(
    /* webpackChunkName: 'JiraScopingSearchFilterMenuRoot' */ './JiraScopingSearchFilterMenuRoot'
  )
)
interface Props {
  meeting: JiraScopingSearchFilterToggle_meeting
}

const JiraScopingSearchFilterToggle = (props: Props) => {
  const {meeting} = props
  const {id: meetingId, teamId} = meeting
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(
    MenuPosition.UPPER_RIGHT,
    {
      loadingWidth: 200,
      noClose: true
    }
  )
  return (
    <>
      <PlainButton onClick={togglePortal} ref={originRef}>
        <FilterIcon>filter_list</FilterIcon>
      </PlainButton>
      {menuPortal(
        <JiraScopingSearchFilterMenuRoot
          teamId={teamId}
          meetingId={meetingId}
          menuProps={menuProps}
        />
      )}
    </>
  )
}

export default createFragmentContainer(JiraScopingSearchFilterToggle, {
  meeting: graphql`
    fragment JiraScopingSearchFilterToggle_meeting on PokerMeeting {
      id
      teamId
    }
  `
})
