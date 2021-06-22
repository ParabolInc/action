import InvoiceLineItem from './InvoiceLineItem'
import {InvoiceLineItemEnum} from './InvoiceLineItem'

interface Input {
  amount: number
  description?: string | null
  quantity: number
}

export default class InvoiceLineItemOtherAdjustments extends InvoiceLineItem {
  details = []
  type = 'OTHER_ADJUSTMENTS' as InvoiceLineItemEnum
  constructor(input: Input) {
    super({...input, type: 'OTHER_ADJUSTMENTS'})
  }
}
