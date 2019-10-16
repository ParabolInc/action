import getDotenv from '../../server/utils/dotenv'
import Stripe from 'stripe'
import {InvoiceItemType} from 'parabol-client/types/constEnums'
import IInvoiceLineItemRetrievalOptions = Stripe.invoices.IInvoiceLineItemRetrievalOptions
// import {toEpochSeconds} from 'server/utils/epochTime'

getDotenv()

export default class StripeManager {
  static PARABOL_PRO_600 = 'parabol-pro-600' // $6/seat/mo
  static PARABOL_ENTERPRISE_2019Q3 = 'plan_Fifb1fmjyFfTm8'
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  async createCustomer(orgId: string, email: string, source?: string) {
    return this.stripe.customers.create({
      email,
      source,
      metadata: {
        orgId
      }
    })
  }

  async createEnterpriseSubscription(customerId: string, orgId: string, quantity) {
    return this.stripe.subscriptions.create({
      // @ts-ignore
      collection_method: 'send_invoice',
      customer: customerId,
      days_until_due: 30,
      metadata: {
        orgId
      },
      prorate: false,
      items: [
        {
          plan: StripeManager.PARABOL_ENTERPRISE_2019Q3,
          quantity
        }
      ]
    })
  }

  async createProSubscription(customerId: string, orgId: string, quantity) {
    return this.stripe.subscriptions.create({
      // USE THIS FOR TESTING A FAILING PAYMENT
      // https://stripe.com/docs/billing/testing
      // trial_end: toEpochSeconds(new Date(Date.now() + 1000 * 10)),
      customer: customerId,
      metadata: {
        orgId
      },
      items: [
        {
          plan: StripeManager.PARABOL_PRO_600,
          quantity
        }
      ]
    })
  }

  async updateSubscriptionQuantity(
    stripeSubscriptionId: string,
    quantity: number,
    prorationDate?: number
  ) {
    return this.stripe.subscriptions.update(stripeSubscriptionId, {
      quantity,
      proration_date: prorationDate
    })
  }

  async updateInvoice(invoiceId: string, orgId: string) {
    return this.stripe.invoices.update(invoiceId, {metadata: {orgId}})
  }

  async updateInvoiceItem(invoiceItemId: string, type: InvoiceItemType, userId: string) {
    return this.stripe.invoiceItems.update(invoiceItemId, {metadata: {type, userId}})
  }

  async retrieveCustomer(customerId: string) {
    return this.stripe.customers.retrieve(customerId)
  }

  async retrieveInvoice(invoiceId: string) {
    return this.stripe.invoices.retrieve(invoiceId)
  }

  async retrieveInvoiceItem(invoiceItemId: string) {
    return this.stripe.invoiceItems.retrieve(invoiceItemId)
  }

  async retrieveInvoiceLines(invoiceId: string, options: IInvoiceLineItemRetrievalOptions) {
    return this.stripe.invoices.retrieveLines(invoiceId, options)
  }

  async retrieveUpcomingInvoice(stripeId: string, stripeSubscriptionId: string) {
    return this.stripe.invoices.retrieveUpcoming(stripeId, {
      subscription: stripeSubscriptionId
    })
  }

  async updateAccountBalance(customerId: string, newBalance: number) {
    return this.stripe.customers.update(customerId, {account_balance: newBalance})
  }

  async updatePayment(customerId: string, source: string) {
    return this.stripe.customers.update(customerId, {source})
  }
}
