import React from 'react'
import {emailCopyStyle, emailLinkStyle, emailProductTeamSignature} from '../styles'
import EmailBlock from './EmailBlock/EmailBlock'
import EmailFooter from './EmailFooter/EmailFooter'
import EmptySpace from './EmptySpace/EmptySpace'
import Header from './Header/Header'
import Layout from './Layout/Layout'

const innerMaxWidth = 480

interface ResetPasswordEmailProps {
  verificationURL: string
  appOrigin: string
}

const EmailVerificationEmail = (props: ResetPasswordEmailProps) => {
  const {appOrigin, verificationURL} = props
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header appOrigin={appOrigin} />
        <p style={emailCopyStyle}>{'Hello 👋'}</p>
        <p style={emailCopyStyle}>{'Tap the link below to verify your email.'}</p>
        <p style={emailCopyStyle}>
          <a href={verificationURL} style={emailLinkStyle} title='Verify My Email'>
            {'Verify My Email'}
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

export default EmailVerificationEmail
