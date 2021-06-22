import React from 'react'
import {emailCopyStyle, emailLinkStyle, emailProductTeamSignature} from '../styles'
import EmailBlock from './EmailBlock/EmailBlock'
import EmailFooter from './EmailFooter/EmailFooter'
import EmptySpace from './EmptySpace/EmptySpace'
import Header from './Header/Header'
import Layout from './Layout/Layout'

const innerMaxWidth = 480

interface ResetPasswordEmailProps {
  appOrigin: string
  resetURL: string
}

const ResetPasswordEmail = (props: ResetPasswordEmailProps) => {
  const {appOrigin, resetURL} = props
  return (
    <Layout maxWidth={544}>
      <EmailBlock innerMaxWidth={innerMaxWidth}>
        <Header appOrigin={appOrigin} />
        <p style={emailCopyStyle}>{'Forget your password?'}</p>
        <p style={emailCopyStyle}>{`No problem, just click the link below.`}</p>
        <p style={emailCopyStyle}>
          <a href={resetURL} style={emailLinkStyle} title='Reset Password'>
            {'Reset Password'}
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

export default ResetPasswordEmail
