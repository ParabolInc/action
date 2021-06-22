import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useStoreQueryRetry from '~/hooks/useStoreQueryRetry'
import SetAppLocationMutation from '~/mutations/SetAppLocationMutation'
import {MeetingSelector_viewer} from '~/__generated__/MeetingSelector_viewer.graphql'
import useRouter from '../hooks/useRouter'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import lazyPreload from '../utils/lazyPreload'

interface Props {
  meetingId: string
  viewer: MeetingSelector_viewer
  retry(): void
}

const meetingLookup = {
  action: lazyPreload(() => import(/* webpackChunkName: 'ActionMeeting' */ './ActionMeeting')),
  poker: lazyPreload(() => import(/* webpackChunkName: 'PokerMeeting' */ './PokerMeeting')),
  retrospective: lazyPreload(() => import(/* webpackChunkName: 'RetroMeeting' */ './RetroMeeting'))
}

const MeetingSelector = (props: Props) => {
  const {meetingId, viewer, retry} = props
  const {isConnected, meeting} = viewer
  const {history} = useRouter()
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (!meeting) {
      history.replace({
        pathname: `/invitation-required`,
        search: `?redirectTo=${encodeURIComponent(window.location.pathname)}&meetingId=${meetingId}`
      })
    }
  }, [])
  useEffect(() => {
    if (!meetingId || !isConnected) return
    const location = `/meet/${meetingId}`
    const setAfterUpgrade = async () => {
      await atmosphere.upgradeTransport()
      SetAppLocationMutation(atmosphere, {location})
    }
    setAfterUpgrade()
    return () => {
      SetAppLocationMutation(atmosphere, {location: null})
    }
  }, [isConnected])
  useStoreQueryRetry(retry)
  useSubscription('MeetingSelector', NotificationSubscription)
  useSubscription('MeetingSelector', OrganizationSubscription)
  useSubscription('MeetingSelector', TaskSubscription)
  useSubscription('MeetingSelector', TeamSubscription)
  if (!meeting) return null
  const {meetingType} = meeting
  const Meeting = meetingLookup[meetingType]
  return <Meeting meeting={meeting} />
}

graphql`
  fragment MeetingSelector_meeting on NewMeeting {
    ...RetroMeeting_meeting
    ...ActionMeeting_meeting
    ...PokerMeeting_meeting
    meetingType
  }
`

export default createFragmentContainer(MeetingSelector, {
  viewer: graphql`
    fragment MeetingSelector_viewer on User {
      isConnected
      meeting(meetingId: $meetingId) {
        ...MeetingSelector_meeting @relay(mask: false)
      }
    }
  `
})
