import Oy from 'oy-vey'
import React from 'react'
import {headCSS} from 'parabol-client/modules/email/styles'
import UpcomingInvoiceEmail, {UpcomingInvoiceEmailProps} from 'parabol-client/modules/email/components/UpcomingInvoiceEmail'

const subject = 'Your monthly summary'

export const makeBody = (props: UpcomingInvoiceEmailProps) => {
  const {periodEndStr, newUsers, memberUrl} = props
  const newUserBullets = newUsers.reduce(
    (str, newUser) => str + `* ${newUser.name} (${newUser.email})\n`,
    ''
  )
  return `
Hello,

Your teams have added the following users to your organization for the billing cycle ending on ${periodEndStr}:
${newUserBullets}

If any of these users were added by mistake, simply remove them under Organization Settings: ${memberUrl}

Your friends,
The Parabol Product Team
`
}

export default (props: UpcomingInvoiceEmailProps) => ({
  subject,
  body: makeBody(props),
  html: Oy.renderTemplate(<UpcomingInvoiceEmail {...props} />, {
    headCSS,
    title: subject,
    previewText: subject
  })
})
