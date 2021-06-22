import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ParabolScopingSearchFilterToggle_meeting} from '../__generated__/ParabolScopingSearchFilterToggle_meeting.graphql'
import PlainButton from './PlainButton/PlainButton'
import styled from '@emotion/styled'
import Icon from './Icon'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import useMenu from '~/hooks/useMenu'
import {MenuPosition} from '~/hooks/useCoords'
import ParabolScopingSearchFilterMenu from './ParabolScopingSearchFilterMenu'

const FilterIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24
})

interface Props {
  meeting: ParabolScopingSearchFilterToggle_meeting
}

const ParabolScopingSearchFilterToggle = (props: Props) => {
  const {meeting} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    loadingWidth: 200,
    noClose: true
  })
  return (
    <>
      <PlainButton onClick={togglePortal} ref={originRef}>
        <FilterIcon>filter_list</FilterIcon>
      </PlainButton>
      {menuPortal(<ParabolScopingSearchFilterMenu meeting={meeting} menuProps={menuProps} />)}
    </>
  )
}

export default createFragmentContainer(ParabolScopingSearchFilterToggle, {
  meeting: graphql`
    fragment ParabolScopingSearchFilterToggle_meeting on PokerMeeting {
      id
      ...ParabolScopingSearchFilterMenu_meeting
    }
  `
})
