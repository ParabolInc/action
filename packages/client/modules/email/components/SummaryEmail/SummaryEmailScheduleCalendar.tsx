import {
  createGoogleCalendarInviteURL,
  makeIcsUrl
} from 'parabol-client/utils/makeCalendarInvites'
import React from 'react'
import {ExternalLinks} from '../../../../types/constEnums'
import EmptySpace from '../../components/EmptySpace/EmptySpace'
import {emailFontFamily} from '../../styles'
import EmailBorderBottom from './MeetingSummaryEmail/EmailBorderBottom'
import {PALETTE} from 'parabol-client/styles/paletteV3'

const message = {
  color: PALETTE.SLATE_700,
  fontFamily: emailFontFamily,
  fontSize: '18px',
  lineHeight: '27px',
  padding: '0 16px',
  textAlign: 'center',
  whiteSpace: 'pre-line'
} as React.CSSProperties

const meetingLinkTable = {
  marginLeft: 'auto',
  marginRight: 'auto'
} as React.CSSProperties

const meetingLinkBlock = {
  // padding: '10px 8px',
  textAlign: 'center'
} as React.CSSProperties

const meetingLink = {
  color: PALETTE.SKY_500,
  textAlign: 'center'
} as React.CSSProperties

const iconSize = 24
const iconLinkBlock = {
  display: 'inline-block',
  margin: '14px',
  minWidth: '211px',
  padding: '9px 8px'
} as React.CSSProperties
const iconLink = {
  color: PALETTE.SKY_500
} as React.CSSProperties

const iconLinkIcon = {
  border: 0,
  display: 'inline-block',
  verticalAlign: 'middle'
} as React.CSSProperties
const iconLinkLabel = {
  display: 'inline-block',
  height: `${iconSize}px`,
  lineHeight: `${iconSize}px`,
  margin: '0 0 0 6px',
  verticalAlign: 'middle'
} as React.CSSProperties

interface Props {
  createdAt: string
  isDemo: boolean
  meetingNumber: number
  meetingUrl: string
  teamName: string
}

const sectionStart = {
  paddingTop: 24
}
/* TODO remove divs */

const SummaryEmailScheduleCalendar = (props: Props) => {
  const {createdAt, isDemo, meetingUrl, meetingNumber, teamName} = props
  if (meetingNumber > 2 || isDemo) return null
  return (
    <>
      <tr>
        <td align='center' style={sectionStart}>
          <div style={message}>
            <div>
              <span>{'Tap here to schedule your next meeting:'}</span>
              <br />
              <div style={iconLinkBlock}>
                <a
                  href={createGoogleCalendarInviteURL(createdAt, meetingUrl, teamName)}
                  rel='noopener noreferrer'
                  style={iconLink}
                  target='_blank'
                >
                  <img
                    crossOrigin=''
                    style={iconLinkIcon}
                    src={`${ExternalLinks.EMAIL_CDN}google@3x.png`}
                    height={iconSize}
                    width={iconSize}
                  />
                  <span style={iconLinkLabel}>{'Google Calendar'}</span>
                </a>
              </div>
              <div style={iconLinkBlock}>
                <a
                  href={makeIcsUrl(createdAt, meetingUrl, teamName)}
                  rel='noopener noreferrer'
                  style={iconLink}
                  target='_blank'
                >
                  <img
                    crossOrigin=''
                    style={iconLinkIcon}
                    src={`${ExternalLinks.EMAIL_CDN}event_available@3x.png`}
                    height={iconSize}
                    width={iconSize}
                  />
                  <span style={iconLinkLabel}>{'Outlook, etc.'}</span>
                </a>
              </div>
            </div>
            {'Or, make your own and include this link as the location:'}
            <EmptySpace height={8} />
            {/*
            // @ts-ignore*/}
            <table align='center' style={meetingLinkTable} width='80%'>
              <tbody>
                <tr>
                  <td align='center' style={meetingLinkBlock}>
                    <a href={meetingUrl} style={meetingLink}>
                      {meetingUrl}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </td>
      </tr>
      <EmailBorderBottom />
    </>
  )
}

export default SummaryEmailScheduleCalendar
