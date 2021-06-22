import {GraphQLList, GraphQLString} from 'graphql'
import {months} from 'parabol-client/utils/makeDateString'
import {Threshold} from '../../../../client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import {UpcomingInvoiceEmailProps} from 'parabol-client/modules/email/components/UpcomingInvoiceEmail'
import UpcomingInvoiceEmailTemplate from '../../../email/UpcomingInvoiceEmailTemplate'
import getMailManager from '../../../email/getMailManager'
import {requireSU} from '../../../utils/authorization'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'

interface Details extends UpcomingInvoiceEmailProps {
  emails: string[]
}

const makePeriodEndStr = (periodEnd: Date) => {
  const date = new Date(periodEnd)
  const month = date.getMonth()
  const day = date.getDate()
  const monthStr = months[month]
  return `${monthStr} ${day}`
}

const getEmailDetails = (organizations) => {
  const details = [] as Details[]
  for (let ii = 0; ii < organizations.length; ii++) {
    const organization = organizations[ii]
    const {id: orgId, billingLeaders, periodEnd} = organization
    const newUsers = organization.newUsers.map((newUser) => ({
      email: newUser.user.email,
      name: newUser.user.preferredName
    }))
    details.push({
      appOrigin,
      emails: billingLeaders.map((billingLeader) => billingLeader.user.email),
      periodEndStr: makePeriodEndStr(periodEnd),
      memberUrl: makeAppURL(appOrigin, `me/organizations/${orgId}/members`),
      newUsers
    })
  }
  return details
}

const sendUpcomingInvoiceEmails = {
  type: new GraphQLList(GraphQLString),
  description:
    'send an email to organizations including all the users that were added in the current billing cycle',
  resolve: async (_source, _args, {authToken}) => {
    requireSU(authToken)
    const r = await getRethink()
    const now = new Date()
    const periodEndThresh = new Date(Date.now() + Threshold.UPCOMING_INVOICE_EMAIL_WARNING)
    const lastSentThresh = new Date(Date.now() - Threshold.UPCOMING_INVOICE_EMAIL_WARNING)

    const organizations = await r
      .table('Organization')
      .getAll('pro', {index: 'tier'})
      .filter((organization) =>
        r.and(
          organization('periodEnd')
            .le(periodEndThresh)
            .default(false),
          organization('upcomingInvoiceEmailSentAt')
            .le(lastSentThresh)
            .default(true)
        )
      )
      .coerceTo('array')
      .merge((organization) => ({
        newUsers: r
          .table('OrganizationUser')
          .getAll(organization('id'), {index: 'orgId'})
          .filter((organizationUser) => organizationUser('newUserUntil').ge(now))
          .filter({removedAt: null, role: null})
          .coerceTo('array')
          .merge((organizationUser) => ({
            user: r
              .table('User')
              .get(organizationUser('userId'))
              .pluck('preferredName', 'email')
          }))
      }))
      .filter((organization) =>
        organization('newUsers')
          .count()
          .ge(1)
      )
      .merge((organization) => ({
        billingLeaders: r
          .table('OrganizationUser')
          .getAll(organization('id'), {index: 'orgId'})
          .filter({role: 'BILLING_LEADER', removedAt: null})
          .coerceTo('array')
          .merge((organizationUser) => ({
            user: r
              .table('User')
              .get(organizationUser('userId'))
              .pluck('preferredName', 'email')
          }))
      }))
      .coerceTo('array')
      .run()

    if (organizations.length === 0) return []

    const details = getEmailDetails(organizations)
    await Promise.all(
      details.map((detail) => {
        const {emails, ...props} = detail
        const {subject, body, html} = UpcomingInvoiceEmailTemplate(props)
        return Promise.all(
          emails.map((to) => {
            return getMailManager().sendEmail({
              to,
              subject,
              body,
              html,
              tags: ['type:upcomingInvoice']
            })
          })
        )
      })
    )
    const orgIds = organizations.map(({id}) => id)
    await r
      .table('Organization')
      .getAll(r.args(orgIds))
      .update({
        upcomingInvoiceEmailSentAt: now
      })
      .run()
    return details.map(({emails}) => emails.join(','))
  }
}

export default sendUpcomingInvoiceEmails
