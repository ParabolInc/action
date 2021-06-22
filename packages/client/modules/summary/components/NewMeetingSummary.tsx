import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import useDocumentTitle from '../../../hooks/useDocumentTitle'
import useRouter from '../../../hooks/useRouter'
import {PALETTE} from '../../../styles/paletteV3'
import {MEETING_SUMMARY_LABEL} from '../../../utils/constants'
import isDemoRoute from '../../../utils/isDemoRoute'
import makeHref from '../../../utils/makeHref'
import {NewMeetingSummary_viewer} from '../../../__generated__/NewMeetingSummary_viewer.graphql'
import {demoTeamId} from '../../demo/initDB'
import MeetingSummaryEmail from '../../email/components/SummaryEmail/MeetingSummaryEmail/MeetingSummaryEmail'

interface Props {
  viewer: NewMeetingSummary_viewer
  urlAction?: 'csv' | undefined
}

const NewMeetingSummary = (props: Props) => {
  const {
    urlAction,
    viewer: {newMeeting}
  } = props
  const {history} = useRouter()
  useEffect(() => {
    if (!newMeeting) {
      history.replace('/me')
    }
  }, [history, newMeeting])
  if (!newMeeting) {
    return null
  }
  const {id: meetingId, name: meetingName, team} = newMeeting
  const {id: teamId, name: teamName} = team
  const title = `${meetingName} ${MEETING_SUMMARY_LABEL} | ${teamName}`
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useDocumentTitle(title, 'Summary')
  const meetingUrl = makeHref(`/meet/${meetingId}`)
  const teamDashUrl = `/team/${teamId}`
  const emailCSVUrl = isDemoRoute()
    ? `/retrospective-demo-summary/csv`
    : `/new-summary/${meetingId}/csv`
  return (
    <div style={{backgroundColor: PALETTE.SLATE_200, minHeight: '100vh'}}>
      <MeetingSummaryEmail
        appOrigin={window.location.origin}
        urlAction={urlAction}
        isDemo={teamId === demoTeamId}
        meeting={newMeeting}
        referrer='meeting'
        meetingUrl={meetingUrl}
        teamDashUrl={teamDashUrl}
        emailCSVUrl={emailCSVUrl}
      />
    </div>
  )
}

export default createFragmentContainer(NewMeetingSummary, {
  viewer: graphql`
    fragment NewMeetingSummary_viewer on User {
      newMeeting(meetingId: $meetingId) {
        ...MeetingSummaryEmail_meeting
        id
        team {
          id
          name
        }
        name
      }
    }
  `
})
