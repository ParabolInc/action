import {InvoiceItemType} from 'parabol-client/types/constEnums'
import generateUID from '../../generateUID'

interface Input {
  id?: string
  stripeSubscriptionId: string
  orgId: string
  createdAt?: Date
  // true if the hook has not yet been sent to Stripe
  isPending?: boolean
  // true if not an enterprise plan
  isProrated: boolean
  // the fixed prorationDate, can be empty if isProrated is false or isPending is true & we want to prorate when processed
  prorationDate?: number
  previousQuantity?: number
  quantity?: number
  previousInvoiceItemId?: string
  invoiceItemId?: string
  type: InvoiceItemType
  userId: string
}

export default class InvoiceItemHook {
  id: string
  createdAt: Date
  invoiceItemId?: string
  isPending: boolean
  isProrated: boolean
  orgId: string
  previousInvoiceItemId?: string
  previousQuantity?: number
  prorationDate?: number
  quantity?: number
  stripeSubscriptionId: string
  type: InvoiceItemType
  userId: string

  constructor(input: Input) {
    const {
      id,
      createdAt,
      invoiceItemId,
      previousInvoiceItemId,
      isPending,
      isProrated,
      orgId,
      previousQuantity,
      prorationDate,
      quantity,
      stripeSubscriptionId,
      type,
      userId
    } = input
    this.id = id || generateUID()
    this.createdAt = createdAt || new Date()
    this.invoiceItemId = invoiceItemId
    this.previousInvoiceItemId = previousInvoiceItemId
    this.isPending = isPending ?? true
    this.isProrated = isProrated
    this.orgId = orgId
    this.previousQuantity = previousQuantity
    this.prorationDate = prorationDate
    this.quantity = quantity
    this.stripeSubscriptionId = stripeSubscriptionId
    this.type = type
    this.userId = userId
  }
}
