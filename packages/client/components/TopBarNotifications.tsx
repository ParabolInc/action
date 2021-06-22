import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import lazyPreload from '~/utils/lazyPreload'
import {TopBarNotifications_viewer} from '~/__generated__/TopBarNotifications_viewer.graphql'
import TopBarIcon from './TopBarIcon'

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
  const notifications = viewer?.notifications || {edges: []}
  const {edges} = notifications
  const hasNotifications = edges.some(({node}) => node.status === 'UNREAD')
  const menuContentRef = useRef<HTMLDivElement>(null)
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT,
    {menuContentRef}
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
      {menuPortal(
        <NotificationDropdown
          parentRef={menuContentRef}
          menuProps={menuProps}
          viewer={viewer || null}
        />
      )}
    </>
  )
}

export default createFragmentContainer(TopBarNotifications, {
  viewer: graphql`
    fragment TopBarNotifications_viewer on User {
      ...NotificationDropdown_viewer
      notifications(first: $first, after: $after)
        @connection(key: "NotificationDropdown_notifications") {
        edges {
          node {
            id
            status
          }
        }
      }
    }
  `
})
