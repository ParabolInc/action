import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import makeDateString from 'parabol-client/utils/makeDateString'
import {SummaryHeader_meeting} from 'parabol-client/__generated__/SummaryHeader_meeting.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ExternalLinks} from '../../../../../types/constEnums'

const meetingSummaryLabel = {
  color: PALETTE.SLATE_600,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  textTransform: 'uppercase',
  fontSize: '12px',
  fontWeight: 600,
  paddingTop: 8,
  textAlign: 'center'
} as React.CSSProperties

const teamNameLabel = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 36,
  fontWeight: 600,
  paddingTop: 16
} as React.CSSProperties

const dateLabel = {
  color: PALETTE.SLATE_600,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: '15px',
  fontWeight: 400,
  paddingTop: 8
} as React.CSSProperties

interface Props {
  meeting: SummaryHeader_meeting
  isDemo?: boolean
}

const SummaryHeader = (props: Props) => {
  const {meeting, isDemo} = props
  const {createdAt, name: meetingName, team} = meeting
  const {name: teamName} = team
  const meetingDate = makeDateString(createdAt, {showDay: true})
  return (
    <table align='center' width='100%'>
      <tbody>
        <tr>
          <td align='center' style={{paddingTop: 16}}>
            <img
              crossOrigin=''
              alt='Parabol Logo'
              src={`${ExternalLinks.EMAIL_CDN}mark-color@3x.png`}
              height='32'
              width='34'
            />
          </td>
        </tr>
        <tr>
          <td align='center' style={meetingSummaryLabel}>
            {'Meeting Summary'}
          </td>
        </tr>
        <tr>
          <td align='center' style={teamNameLabel}>
            {meetingName}
          </td>
        </tr>
        <tr>
          <td align='center' style={dateLabel}>
            {isDemo ? meetingDate : `${teamName} • ${meetingDate}`}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default createFragmentContainer(SummaryHeader, {
  meeting: graphql`
    fragment SummaryHeader_meeting on NewMeeting {
      createdAt
      name
      team {
        name
      }
    }
  `
})
