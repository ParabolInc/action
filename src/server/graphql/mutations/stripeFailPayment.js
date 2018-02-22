import {GraphQLID, GraphQLNonNull} from 'graphql';
import fetchAllLines from 'server/billing/helpers/fetchAllLines';
import terminateSubscription from 'server/billing/helpers/terminateSubscription';
import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import StripeFailPaymentPayload from 'server/graphql/types/StripeFailPaymentPayload';
import publish from 'server/utils/publish';
import shortid from 'shortid';
import {BILLING_LEADER, FAILED, NOTIFICATION, PAYMENT_REJECTED} from 'universal/utils/constants';

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
  resolve: async (source, {invoiceId}, {serverSecret}) => {
    // AUTH
    if (serverSecret !== process.env.AUTH0_CLIENT_SECRET) {
      throw new Error('Don’t be rude.');
    }

    const r = getRethink();
    const now = new Date();

    // VALIDATION
    const {amount_due: amountDue, customer: customerId, metadata, subscription, paid} = await stripe.invoices.retrieve(invoiceId);
    let orgId = metadata.orgId;
    if (!orgId) {
      ({metadata: {orgId}} = await stripe.customers.retrieve(customerId));
      if (!orgId) {
        throw new Error(`Could not find orgId on invoice ${invoiceId}`);
      }
    }
    const org = await r.table('Organization').get(orgId).pluck('creditCard', 'stripeSubscriptionId');
    const {creditCard, stripeSubscriptionId} = org;

    if (paid || stripeSubscriptionId !== subscription) return {orgId};

    // RESOLUTION
    const stripeLineItems = await fetchAllLines(invoiceId);
    const nextMonthCharges = stripeLineItems.find((line) => line.description === null && line.proration === false);
    const nextMonthAmount = nextMonthCharges && nextMonthCharges.amount || 0;

    const orgDoc = await terminateSubscription(orgId);
    const userIds = orgDoc.orgUsers.reduce((billingLeaders, orgUser) => {
      if (orgUser.role === BILLING_LEADER) {
        billingLeaders.push(orgUser.id);
      }
      return billingLeaders;
    }, []);
    const {last4, brand} = creditCard;
    await stripe.customers.update(customerId, {
      // amount_due includes the old account_balance, so we can (kinda) atomically set this
      // we take out the charge for future services since we are ending service immediately
      account_balance: amountDue - nextMonthAmount
    });
    const notificationId = shortid.generate();
    const notification = {
      id: notificationId,
      type: PAYMENT_REJECTED,
      startAt: now,
      orgId,
      userIds,
      last4,
      brand
    };

    await r({
      update: r.table('Invoice').get(invoiceId).update({status: FAILED}),
      insert: r.table('Notification').insert(notification)
    });
    const data = {orgId, notificationId};
    // TODO add in subOptins when we move GraphQL to its own microservice
    publish(NOTIFICATION, orgId, StripeFailPaymentPayload, data);
    return data;
  }
};
