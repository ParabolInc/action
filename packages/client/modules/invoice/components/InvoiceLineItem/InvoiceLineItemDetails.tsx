import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {InvoiceLineItemDetails_details} from '~/__generated__/InvoiceLineItemDetails_details.graphql'
import {InvoiceLineItemEnum} from '~/__generated__/InvoiceLineItem_item.graphql'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint} from '../../../../types/constEnums'
import makeDateString from '../../../../utils/makeDateString'
import invoiceLineFormat from '../../helpers/invoiceLineFormat'

const detailDescriptionMaker = {
  ADDED_USERS: (detail) => `${detail.email} joined ${makeDateString(detail.startAt)}`,
  REMOVED_USERS: (detail) => `${detail.email} left ${makeDateString(detail.startAt)}`,
  INACTIVITY_ADJUSTMENTS: (detail) => {
    if (!detail.endAt) {
      return `${detail.email} has been paused since ${makeDateString(detail.startAt)}`
    } else if (!detail.startAt) {
      return `${detail.email} was paused until ${makeDateString(detail.endAt)}`
    }
    return `${detail.email} was paused from ${makeDateString(detail.startAt)} to ${makeDateString(
      detail.endAt
    )}`
  }
} as const

const Details = styled('div')({
  display: 'block'
})

const DetailsToggle = styled('div')({
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  lineHeight: '20px',
  textTransform: 'uppercase'
})

const DetailsInner = styled('div')<{isOpen: boolean}>(({isOpen}) => ({
  display: isOpen ? 'block' : 'none'
}))

const DetailsItem = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  fontSize: 13,
  lineHeight: '22px',
  paddingRight: 12,

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    paddingRight: 20
  }
})

const DetailsFill = styled('div')({
  flex: 1,
  paddingRight: 16
})

interface Props {
  details: InvoiceLineItemDetails_details | null
  type: Exclude<InvoiceLineItemEnum, 'OTHER_ADJUSTMENTS'>
}

const InvoiceLineItemDetails = (props: Props) => {
  const {details, type} = props
  const [isOpen, setIsOpen] = useState(false)
  const toggleDetails = () => {
    setIsOpen(!isOpen)
  }
  if (!details) return null
  return (
    <Details className={'hide-print'}>
      <DetailsToggle onClick={toggleDetails}>
        {isOpen ? 'Hide Details' : 'View Details'}
      </DetailsToggle>
      <DetailsInner isOpen={isOpen}>
        {details.map((d) => {
          const amount = invoiceLineFormat(d.amount)
          const description = detailDescriptionMaker[type](d)
          return (
            <DetailsItem key={d.id}>
              <DetailsFill>{description}</DetailsFill>
              <div>{amount}</div>
            </DetailsItem>
          )
        })}
      </DetailsInner>
    </Details>
  )
}

export default createFragmentContainer(InvoiceLineItemDetails, {
  details: graphql`
    fragment InvoiceLineItemDetails_details on InvoiceLineItemDetails @relay(plural: true) {
      id
      amount
      email
      endAt
      startAt
    }
  `
})
