import {PALETTE} from 'parabol-client/styles/paletteV3'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ResetPasswordEmail from '../../client/modules/email/components/ResetPasswordEmail'
import emailTemplate from './emailTemplate'
import makeAppURL from '../../client/utils/makeAppURL'
import appOrigin from '../appOrigin'
interface Props {
  resetPasswordToken: string
}

const resetPasswordEmailCreator = (props: Props) => {
  const {resetPasswordToken} = props
  const resetURL = makeAppURL(appOrigin, `reset-password/${resetPasswordToken}`)
  const bodyContent = ReactDOMServer.renderToStaticMarkup(
    <ResetPasswordEmail appOrigin={appOrigin} resetURL={resetURL} />
  )

  const subject = `Request to Reset Your Password`
  const html = emailTemplate({
    bodyContent,
    title: subject,
    previewText: subject,
    bgColor: PALETTE.SLATE_200
  })

  return {
    subject,
    body: `Forget your password? No problem, just go here: ${resetURL}`,
    html
  }
}

export default resetPasswordEmailCreator
