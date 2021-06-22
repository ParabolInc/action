import graphql from 'babel-plugin-relay/macro'
import {MeetingSummaryEmailRootSSRQuery} from 'parabol-client/__generated__/MeetingSummaryEmailRootSSRQuery.graphql'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import {Environment} from 'relay-runtime'
import makeAppURL from '../../../utils/makeAppURL'
import MeetingSummaryEmail from './SummaryEmail/MeetingSummaryEmail/MeetingSummaryEmail'

const query = graphql`
  query MeetingSummaryEmailRootSSRQuery($meetingId: ID!) {
    viewer {
      newMeeting(meetingId: $meetingId) {
        meetingType
        team {
          id
        }
        ...MeetingSummaryEmail_meeting
      }
    }
  }
`

interface Props {
  appOrigin: string
  environment: Environment
  meetingId: string
}

export const meetingSummaryUrlParams = {
  utm_source: 'summary email',
  utm_medium: 'email',
  utm_campaign: 'after-meeting'
}

const MeetingSummaryEmailRootSSR = (props: Props) => {
  const {appOrigin, environment, meetingId} = props
  return (
    <QueryRenderer<MeetingSummaryEmailRootSSRQuery>
      environment={environment}
      query={query}
      variables={{meetingId}}
      render={({props}) => {
        if (!props) return null
        const {viewer} = props
        if (!viewer) return null
        const {newMeeting} = viewer
        if (!newMeeting) return null
        const {team} = newMeeting
        const {id: teamId} = team
        const options = {searchParams: meetingSummaryUrlParams}
        const referrerUrl = makeAppURL(appOrigin, `new-summary/${meetingId}`, options)
        const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`, options)
        const teamDashUrl = makeAppURL(appOrigin, `team/${teamId}`, options)
        const emailCSVUrl = makeAppURL(appOrigin, `new-summary/${meetingId}/csv`, options)
        return (
          <MeetingSummaryEmail
            meeting={newMeeting}
            referrer={'email'}
            teamDashUrl={teamDashUrl}
            meetingUrl={meetingUrl}
            referrerUrl={referrerUrl}
            emailCSVUrl={emailCSVUrl}
            appOrigin={appOrigin}
          />
        )
      }}
    />
  )
}

export default MeetingSummaryEmailRootSSR
