import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import MeetingSubscription from '~/subscriptions/MeetingSubscription'
import useAtmosphere from '../hooks/useAtmosphere'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import {RetroDemo} from '../types/constEnums'
import RetroMeeting from './RetroMeeting'

const query = graphql`
  query DemoMeetingRootQuery($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        ...RetroMeeting_meeting
      }
    }
  }
`

const DemoMeetingRoot = () => {
  const atmosphere = useAtmosphere()
  useSubscription('DemoMeetingRoot', NotificationSubscription)
  useSubscription('DemoMeetingRoot', OrganizationSubscription)
  useSubscription('DemoMeetingRoot', TaskSubscription)
  useSubscription('DemoMeetingRoot', TeamSubscription)
  useSubscription('DemoMeetingRoot', MeetingSubscription, {meetingId: RetroDemo.MEETING_ID})
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{meetingId: RetroDemo.MEETING_ID}}
      render={({props}) => {
        if (props) {
          return <RetroMeeting meeting={(props as any).viewer.meeting} />
        }
        return null
      }}
    />
  )
}

export default DemoMeetingRoot
