import stripe from '../../../billing/stripe'
import {fromEpochSeconds} from '../../../utils/epochTime'
import getUpcomingInvoiceId from '../../../utils/getUpcomingInvoiceId'

export default async function makeUpcomingInvoice(orgId, stripeId, stripeSubscriptionId) {
  if (!stripeId || !stripeSubscriptionId) return undefined
  let stripeInvoice
  try {
    stripeInvoice = await stripe.invoices.retrieveUpcoming(stripeId, {
      subscription: stripeSubscriptionId
    })
  } catch (e) {
    // useful for debugging prod accounts in dev
    return undefined
  }
  return {
    id: getUpcomingInvoiceId(orgId),
    amountDue: stripeInvoice.amount_due,
    total: stripeInvoice.total,
    endAt: fromEpochSeconds(stripeInvoice.period_end),
    invoiceDate: fromEpochSeconds(stripeInvoice.date),
    orgId,
    startAt: fromEpochSeconds(stripeInvoice.period_start),
    startingBalance: stripeInvoice.startingBalance,
    status: 'UPCOMING'
  }
}
