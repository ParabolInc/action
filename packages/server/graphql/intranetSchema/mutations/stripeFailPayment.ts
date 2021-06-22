import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import fetchAllLines from '../../../billing/helpers/fetchAllLines'
import terminateSubscription from '../../../billing/helpers/terminateSubscription'
import getRethink from '../../../database/rethinkDriver'
import NotificationPaymentRejected from '../../../database/types/NotificationPaymentRejected'
import {isSuperUser} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import StripeManager from '../../../utils/StripeManager'
import {InternalContext} from '../../graphql'
import StripeFailPaymentPayload from '../../types/StripeFailPaymentPayload'

export default {
  name: 'StripeFailPayment',
  description: 'When stripe tells us an invoice payment failed, update it in our DB',
  type: StripeFailPaymentPayload,
  args: {
    invoiceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stripe invoice ID'
    }
  },
  resolve: async (_source, {invoiceId}, {authToken}: InternalContext) => {
    // AUTH
    if (!isSuperUser(authToken)) {
      throw new Error('Don’t be rude.')
    }

    const r = await getRethink()
    const manager = new StripeManager()

    // VALIDATION
    const invoice = await manager.retrieveInvoice(invoiceId)
    const {amount_due: amountDue, customer, metadata, subscription, paid} = invoice
    const customerId = customer as string
    let orgId = metadata.orgId
    if (!orgId) {
      const customer = await manager.retrieveCustomer(customerId)
      orgId = customer.metadata.orgid
      if (!orgId) {
        throw new Error(`Could not find orgId on invoice ${invoiceId}`)
      }
    }
    const org = await r
      .table('Organization')
      .get(orgId)
      .pluck('creditCard', 'stripeSubscriptionId')
      .default(null)
      .run()

    if (!org) {
      // org no longer exists, can fail silently (useful for all the staging server bugs)
      return {error: {message: 'Org does not exist'}}
    }
    const {creditCard, stripeSubscriptionId} = org

    if (paid || stripeSubscriptionId !== subscription) return {orgId}

    // RESOLUTION
    const stripeLineItems = await fetchAllLines(invoiceId)
    const nextPeriodCharges = stripeLineItems.find(
      (line) => line.description === null && line.proration === false
    )
    const nextPeriodAmount = (nextPeriodCharges && nextPeriodCharges.amount) || 0

    await terminateSubscription(orgId)
    const billingLeaderUserIds = (await r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({removedAt: null, role: 'BILLING_LEADER'})('userId')
      .run()) as string[]
    const {last4, brand} = creditCard!
    // amount_due includes the old account_balance, so we can (kinda) atomically set this
    // we take out the charge for future services since we are ending service immediately
    await manager.updateAccountBalance(customerId, amountDue - nextPeriodAmount)

    const notifications = billingLeaderUserIds.map(
      (userId) => new NotificationPaymentRejected({orgId, last4, brand, userId})
    )

    await r({
      update: r
        .table('Invoice')
        .get(invoiceId)
        .update({status: 'FAILED'}),
      insert: r.table('Notification').insert(notifications)
    }).run()

    notifications.forEach((notification) => {
      const data = {orgId, notificationId: notification.id}
      publish(SubscriptionChannel.NOTIFICATION, orgId, 'StripeFailPaymentPayload', data)
    })

    const notificationId = notifications?.[0]?.id
    const data = {orgId, notificationId}
    return data
  }
}
