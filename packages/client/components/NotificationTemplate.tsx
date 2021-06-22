import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import React, {ReactNode} from 'react'
import {createFragmentContainer} from 'react-relay'
import NotificationSubtitle from '~/components/NotificationSubtitle'
import useRefreshInterval from '~/hooks/useRefreshInterval'
import {NotificationTemplate_notification} from '~/__generated__/NotificationTemplate_notification.graphql'
import parabolLogo from 'static/images/brand/mark-color.svg'
import NotificationBody from './NotificationBody'
import NotificationMessage from './NotificationMessage'
import NotificationRow from './NotificationRow'

interface Props {
  avatar?: string
  message: string
  notification: NotificationTemplate_notification
  action?: ReactNode
  children?: ReactNode
}

const NotificationTemplate = (props: Props) => {
  const {avatar, message, notification, action, children} = props
  const {createdAt, status} = notification
  // keep the timestamp fresh
  useRefreshInterval(ms('1m'))
  return (
    <NotificationRow avatar={avatar || parabolLogo} isParabol={!avatar} status={status}>
      <NotificationBody>
        <NotificationMessage>{message}</NotificationMessage>
        <NotificationSubtitle timestamp={createdAt}>{action}</NotificationSubtitle>
        {children}
      </NotificationBody>
    </NotificationRow>
  )
}

export default createFragmentContainer(NotificationTemplate, {
  notification: graphql`
    fragment NotificationTemplate_notification on Notification {
      createdAt
      status
    }
  `
})
