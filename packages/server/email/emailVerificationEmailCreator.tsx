import {PALETTE} from 'parabol-client/styles/paletteV3'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import emailTemplate from './emailTemplate'
import EmailVerificationEmail from 'parabol-client/modules/email/components/EmailVerificationEmail'
import appOrigin from '../appOrigin'
import makeAppURL from '../../client/utils/makeAppURL'

interface Props {
  verifiedEmailToken: string
  invitationToken: string | null | undefined
}

const emailVerificationEmailCreator = (props: Props) => {
  const {invitationToken, verifiedEmailToken} = props
  const fullToken = invitationToken
    ? `${verifiedEmailToken}/${invitationToken}`
    : verifiedEmailToken
  const searchParams = {
    utm_source: 'verify account',
    utm_medium: 'email',
    utm_campaign: 'invitations'
  }
  const options = {searchParams}
  const verificationURL = makeAppURL(appOrigin, `verify-email/${fullToken}`, options)
  const bodyContent = ReactDOMServer.renderToStaticMarkup(
    <EmailVerificationEmail appOrigin={appOrigin} verificationURL={verificationURL} />
  )

  const subject = `Verify your email address`
  const html = emailTemplate({
    bodyContent,
    title: subject,
    previewText: subject,
    bgColor: PALETTE.SLATE_200
  })

  return {
    subject,
    body: `Verification complete! Just go here: ${verificationURL}`,
    html
  }
}

export default emailVerificationEmailCreator
