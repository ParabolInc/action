import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
// import lazyPreload from '../utils/lazyPreload'
// import {GitHubScopingSearchFilterToggle_meeting} from '../__generated__/GitHubScopingSearchFilterToggle_meeting.graphql'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

const FilterIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD24
})

// const GitHubScopingSearchFilterMenuRoot = lazyPreload(() =>
//   import(
//     /* webpackChunkName: 'GitHubScopingSearchFilterMenuRoot' */ './GitHubScopingSearchFilterMenuRoot'
//   )
// )
// interface Props {
//   meeting: GitHubScopingSearchFilterToggle_meeting
// }

const GitHubScopingSearchFilterToggle = () => {
  // const {meeting} = props
  // const {id: meetingId, teamId} = meeting
  // const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
  const {togglePortal, originRef} = useMenu(MenuPosition.UPPER_RIGHT, {
    loadingWidth: 200,
    noClose: true
  })
  return (
    <>
      <PlainButton onClick={togglePortal} ref={originRef}>
        <FilterIcon>filter_list</FilterIcon>
      </PlainButton>
      {/* {menuPortal(
        <GitHubScopingSearchFilterMenuRoot
          teamId={teamId}
          meetingId={meetingId}
          menuProps={menuProps}
        />
      )} */}
    </>
  )
}

export default createFragmentContainer(GitHubScopingSearchFilterToggle, {
  meeting: graphql`
    fragment GitHubScopingSearchFilterToggle_meeting on PokerMeeting {
      id
      teamId
    }
  `
})
