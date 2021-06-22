import generateUID from '../../generateUID'
import InvoiceLineItemDetail from './InvoiceLineItemDetail'

export type InvoiceLineItemEnum =
  | 'ADDED_USERS'
  | 'INACTIVITY_ADJUSTMENTS'
  | 'OTHER_ADJUSTMENTS'
  | 'REMOVED_USERS'

interface Input {
  id?: string
  amount: number
  description?: string | null
  details?: InvoiceLineItemDetail[]
  quantity: number
  type: InvoiceLineItemEnum
}

export default class InvoiceLineItem {
  id: string
  amount: number
  description: string | null
  details: InvoiceLineItemDetail[]
  quantity: number
  type: InvoiceLineItemEnum

  constructor(input: Input) {
    const {quantity, amount, id, description, details, type} = input
    this.id = id || generateUID()
    this.amount = amount
    this.description = description || null
    this.details = details || []
    this.quantity = quantity
    this.type = type
  }
}
