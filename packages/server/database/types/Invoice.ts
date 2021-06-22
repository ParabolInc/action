import CreditCard from './CreditCard'
import Coupon from './Coupon'
import InvoiceLineItem from './InvoiceLineItem'
import NextPeriodCharges from './NextPeriodCharges'

export type InvoiceStatusEnum = 'FAILED' | 'PAID' | 'PENDING' | 'UPCOMING'
export type TierEnum = 'enterprise' | 'personal' | 'pro'

interface Input {
  id: string
  amountDue: number
  createdAt?: Date
  coupon?: Coupon | null
  total: number
  billingLeaderEmails: string[]
  creditCard?: CreditCard
  endAt: Date
  invoiceDate: Date
  lines: InvoiceLineItem[]
  nextPeriodCharges: NextPeriodCharges
  orgId: string
  orgName?: string | null
  paidAt?: Date | null
  payUrl?: string | null
  picture?: string | null
  startAt: Date
  startingBalance: number
  status: InvoiceStatusEnum
  tier: TierEnum
}

export default class Invoice {
  id: string
  amountDue: number
  createdAt: Date
  coupon?: Coupon | null
  total: number
  billingLeaderEmails: string[]
  creditCard?: CreditCard
  endAt: Date
  invoiceDate: Date
  lines: InvoiceLineItem[]
  nextPeriodCharges: NextPeriodCharges
  orgId: string
  orgName: string
  paidAt: Date | null
  payUrl?: string | null
  picture: string | null
  startAt: Date
  startingBalance: number
  status: InvoiceStatusEnum
  tier: TierEnum
  updatedAt?: Date

  constructor(input: Input) {
    const {
      id,
      amountDue,
      createdAt,
      coupon,
      billingLeaderEmails,
      creditCard,
      endAt,
      invoiceDate,
      lines,
      nextPeriodCharges,
      orgId,
      orgName,
      paidAt,
      payUrl,
      picture,
      startAt,
      startingBalance,
      status,
      total,
      tier
    } = input
    this.id = id
    this.amountDue = amountDue
    this.createdAt = createdAt || new Date()
    this.coupon = coupon
    this.total = total
    this.billingLeaderEmails = billingLeaderEmails
    this.creditCard = creditCard
    this.endAt = endAt
    this.invoiceDate = invoiceDate
    this.lines = lines
    this.nextPeriodCharges = nextPeriodCharges
    this.orgId = orgId
    this.orgName = orgName || 'Unknown Org'
    this.paidAt = paidAt || null
    this.payUrl = payUrl || undefined
    this.picture = picture || null
    this.startAt = startAt
    this.startingBalance = startingBalance
    this.status = status
    this.tier = tier
  }
}
