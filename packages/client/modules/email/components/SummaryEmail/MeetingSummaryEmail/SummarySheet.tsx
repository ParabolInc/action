import graphql from 'babel-plugin-relay/macro'
import CreateAccountSection from 'parabol-client/modules/demo/components/CreateAccountSection'
import {sheetShadow} from 'parabol-client/styles/elevation'
import {ACTION} from 'parabol-client/utils/constants'
import {SummarySheet_meeting} from 'parabol-client/__generated__/SummarySheet_meeting.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import ExportToCSV from '../ExportToCSV'
import ContactUsFooter from './ContactUsFooter'
import LogoFooter from './LogoFooter'
import MeetingMembersWithoutTasks from './MeetingMembersWithoutTasks'
import MeetingMembersWithTasks from './MeetingMembersWithTasks'
import {MeetingSummaryReferrer} from './MeetingSummaryEmail'
import QuickStats from './QuickStats'
import RetroTopics from './RetroTopics'
import SummaryHeader from './SummaryHeader'
import SummarySheetCTA from './SummarySheetCTA'
import SummaryPokerStories from './SummaryPokerStories'

interface Props {
  emailCSVUrl: string
  isDemo?: boolean
  meeting: SummarySheet_meeting
  appOrigin: string
  referrer: MeetingSummaryReferrer
  referrerUrl?: string
  teamDashUrl: string
  urlAction?: 'csv'
}

const sheetStyle = {
  borderSpacing: 0,
  boxShadow: sheetShadow
}

const SummarySheet = (props: Props) => {
  const {emailCSVUrl, urlAction, meeting, referrer, teamDashUrl, appOrigin} = props
  const {id: meetingId, meetingType} = meeting
  const isDemo = !!props.isDemo
  return (
    <table width='100%' height='100%' align='center' bgcolor='#FFFFFF' style={sheetStyle}>
      <tbody>
        <tr>
          <td>
            <SummaryHeader meeting={meeting} />
            <QuickStats meeting={meeting} />
          </td>
        </tr>
        <SummarySheetCTA referrer={referrer} isDemo={isDemo} teamDashUrl={teamDashUrl} />
        <ExportToCSV
          emailCSVUrl={emailCSVUrl}
          meetingId={meetingId}
          urlAction={urlAction}
          referrer={referrer}
        />
        <CreateAccountSection dataCy='create-account-section' isDemo={isDemo} />
        <MeetingMembersWithTasks meeting={meeting} />
        <MeetingMembersWithoutTasks meeting={meeting} />
        <RetroTopics isDemo={isDemo} isEmail={referrer === 'email'} meeting={meeting} appOrigin={appOrigin} />
        <SummaryPokerStories meeting={meeting} isEmail={referrer === 'email'} />
        <ContactUsFooter
          isDemo={isDemo}
          hasLearningLink={meetingType === ACTION}
          prompt={`How’d your meeting go?`}
          tagline='We’re eager for your feedback!'
        />
        <LogoFooter />
      </tbody>
    </table>
  )
}

export default createFragmentContainer(SummarySheet, {
  meeting: graphql`
    fragment SummarySheet_meeting on NewMeeting {
      id
      ...SummaryHeader_meeting
      ...QuickStats_meeting
      ...MeetingMembersWithTasks_meeting
      ...MeetingMembersWithoutTasks_meeting
      ...RetroTopics_meeting
      ...SummaryPokerStories_meeting
      meetingType
      name
    }
  `
})
