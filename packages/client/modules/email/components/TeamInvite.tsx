import {ExternalLinks} from 'parabol-client/types/constEnums'
import React from 'react'
import {emailCopyStyle, emailLinkStyle, emailProductTeamSignature} from '../styles'
import Button from './Button'
import EmailBlock from './EmailBlock/EmailBlock'
import EmailFooter from './EmailFooter/EmailFooter'
import EmptySpace from './EmptySpace/EmptySpace'
import Header from './Header/Header'
import Layout from './Layout/Layout'

const innerMaxWidth = 480

const boldStyle = {
  ...emailCopyStyle,
  fontWeight: 600
}

const videoLinkStyle = {
  border: 0,
  display: 'block',
  margin: '0 auto',
  textDecoration: 'none'
}

const videoGraphicStyle = {
  display: 'block',
  margin: '0 auto',
  maxWidth: innerMaxWidth,
  width: '100%'
}

const videoGraphicSrc = `${ExternalLinks.EMAIL_CDN}retro-video-still.png`

export interface TeamInviteProps {
  appOrigin: string
  inviteeName: string
  inviteeEmail: string
  inviterName: string
  inviterEmail: string
  inviteLink: string
  teamName: string
  meeting?: {
    meetingType: string
    name: string
  }
}

const TeamInvite = (props: TeamInviteProps) => {
  const {
    appOrigin,
    inviterName,
    inviterEmail,
    inviteeEmail,
    inviteeName,
    meeting,
    teamName,
    inviteLink
  } = props
  const inviteeEmailBlock = (
    <a href={`mailto:${inviteeEmail}`} style={emailCopyStyle}>
      {inviteeEmail}
    </a>
  )
  const nameOrEmail = inviteeName || inviteeEmailBlock
  const meetingCopyLabelLookup = {
    action: 'a Check-in Meeting',
    retrospective: 'a Retrospective Meeting'
  }
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header appOrigin={appOrigin} />
        {meeting ? (
          <div>
            <p style={emailCopyStyle}>
              {'Hi '}
              <span style={emailCopyStyle}>{nameOrEmail}</span>
              {','}
            </p>
            <p style={emailCopyStyle}>
              <span style={boldStyle}>{inviterName}</span>
              {' ('}
              <a href={`mailto:${inviterEmail}`} style={emailLinkStyle}>
                {inviterEmail}
              </a>
              {`) has started ${meetingCopyLabelLookup[meeting.meetingType]} for your team (`}
              <b>{teamName}</b>
              {'). Just a few clicks and you’re in!'}
            </p>
            <Button url={inviteLink}>Join {meeting.name}</Button>
          </div>
        ) : (
            <div>
              <p style={emailCopyStyle}>
                {'Hi '}
                <span style={emailCopyStyle}>{nameOrEmail}</span>
                {','}
              </p>
              <p style={emailCopyStyle}>
                <span style={boldStyle}>{inviterName}</span>
                {' ('}
                <a href={`mailto:${inviterEmail}`} style={emailLinkStyle}>
                  {inviterEmail}
                </a>
                {') has invited you to join a team ('}
                <b>{teamName}</b>
                {') on Parabol.'}
              </p>
              <Button url={inviteLink}>Join Team</Button>
            </div>
          )}
        <EmptySpace height={24} />
        <p style={emailCopyStyle}>
          <span style={boldStyle}>{'New to Parabol?'}</span>
          <br />
          {
            'Parabol is software for remote teams to run online retrospective and check-in meetings. See the video and links below:'
          }
        </p>
        <a href={ExternalLinks.GETTING_STARTED_RETROS} style={videoLinkStyle} title='Retro 101'>
          <img crossOrigin='' alt='' src={videoGraphicSrc} style={videoGraphicStyle} />
        </a>
        <EmptySpace height={24} />
        <p style={emailCopyStyle}>
          {'Learn more about Parabol meetings:'}
          <br />
          <a
            href={ExternalLinks.GETTING_STARTED_RETROS}
            style={emailLinkStyle}
            title='Getting Started: Retro 101'
          >
            {'Getting Started: Retro 101'}
          </a>
          <br />
          <a
            href={ExternalLinks.GETTING_STARTED_CHECK_INS}
            style={emailLinkStyle}
            title='Leveling Up: Check-in 101'
          >
            {'Leveling Up: Check-in 101'}
          </a>
        </p>
        <p style={emailCopyStyle}>
          {'Get in touch if we can help in any way,'}
          <br />
          {emailProductTeamSignature}
          <br />
          <a href='mailto:love@parabol.co' style={emailLinkStyle} title='love@parabol.co'>
            {'love@parabol.co'}
          </a>
        </p>
        <EmptySpace height={16} />
      </EmailBlock>
      <EmailBlock hasBackgroundColor innerMaxWidth={innerMaxWidth}>
        <EmailFooter />
      </EmailBlock>
    </Layout>
  )
}

export default TeamInvite
