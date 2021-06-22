import React from 'react'
import invoiceLineFormat from '../../helpers/invoiceLineFormat'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {
  InvoiceLineItem_item,
  InvoiceLineItemEnum
} from '~/__generated__/InvoiceLineItem_item.graphql'
import plural from '../../../../utils/plural'
import InvoiceLineItemDetails from './InvoiceLineItemDetails'
import InvoiceLineItemContent from './InvoiceLineItemContent'

const descriptionMaker = {
  ADDED_USERS: (quantity) => `${quantity} new ${plural(quantity, 'user')} added`,
  REMOVED_USERS: (quantity) => `${quantity} ${plural(quantity, 'user')} removed`,
  INACTIVITY_ADJUSTMENTS: () => 'Adjustments for paused users'
} as const

interface Props {
  item: InvoiceLineItem_item
}

const InvoiceLineItem = (props: Props) => {
  const {item} = props
  const {quantity, details} = item
  const type = item.type as Exclude<InvoiceLineItemEnum, 'OTHER_ADJUSTMENTS'>
  const amount = invoiceLineFormat(item.amount)
  const description = item.description || descriptionMaker[type](quantity)
  return (
    <InvoiceLineItemContent description={description} amount={amount}>
      <InvoiceLineItemDetails details={details} type={type} />
    </InvoiceLineItemContent>
  )
}

export default createFragmentContainer(InvoiceLineItem, {
  item: graphql`
    fragment InvoiceLineItem_item on InvoiceLineItem {
      amount
      description
      details {
        ...InvoiceLineItemDetails_details
      }
      quantity
      type
    }
  `
})
