import graphql from 'babel-plugin-relay/macro'
import {MenuPosition} from 'hooks/useCoords'
import useMenu from 'hooks/useMenu'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import lazyPreload from 'utils/lazyPreload'
import TopBarIcon from './TopBarIcon'
import {TopBarNotifications_viewer} from '__generated__/TopBarNotifications_viewer.graphql'

const NotificationDropdown = lazyPreload(() =>
  import(
    /* webpackChunkName: 'NotificationDropdown' */
    './NotificationDropdown'
  )
)

interface Props {
  viewer: TopBarNotifications_viewer | null
}

const TopBarNotifications = (props: Props) => {
  const {viewer} = props
  const {notifications} = viewer || {notifications: {edges: []}}
  const {edges} = notifications
  const hasNotifications = edges.length > 0
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT
  )
  return (
    <>
      <TopBarIcon
        ref={originRef}
        onClick={togglePortal}
        onMouseEnter={NotificationDropdown.preload}
        icon={'notifications'}
        hasBadge={hasNotifications}
      />
      {menuPortal(<NotificationDropdown menuProps={menuProps} viewer={viewer || null} />)}
    </>
  )
}

export default createFragmentContainer(TopBarNotifications, {
  viewer: graphql`
    fragment TopBarNotifications_viewer on User {
      ...NotificationDropdown_viewer
      notifications(first: 100) @connection(key: "NotificationDropdown_notifications") {
        edges {
          node {
            id
          }
        }
      }
    }
  `
})
