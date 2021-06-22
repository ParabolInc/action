import React from 'react'
import InvoiceHeader from '../InvoiceHeader/InvoiceHeader'
import InvoiceFooter from '../InvoiceFooter/InvoiceFooter'
import makeMonthString from '../../../../utils/makeMonthString'
import makeDateString from '../../../../utils/makeDateString'
import InvoiceLineItem from '../InvoiceLineItem/InvoiceLineItem'
import InvoiceLineItemContent from '../InvoiceLineItem/InvoiceLineItemContent'
import invoiceLineFormat from '../../helpers/invoiceLineFormat'
import {Elevation} from '../../../../styles/elevation'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {InvoiceStatusEnum, Invoice_viewer} from '~/__generated__/Invoice_viewer.graphql'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint} from '../../../../types/constEnums'
import InvoiceFailedStamp from './InvoiceFailedStamp'
import InvoiceTag from './InvoiceTag'
import EmphasisTag from '../../../../components/Tag/EmphasisTag'
import NextPeriodChargesLineItem from '../InvoiceLineItem/NextPeriodChargesLineItem'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'

const chargeStatus = {
  PAID: 'Charged',
  FAILED: 'Failed charge',
  PENDING: 'Pending charge',
  UPCOMING: 'Will be charged'
} as Record<InvoiceStatusEnum, string>

const AmountSection = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  marginTop: 1,
  paddingTop: 16,
  paddingRight: 12,

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    paddingTop: 32,
    paddingRight: 20
  }
})

const AmountLine = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  fontSize: 24,
  fontWeight: 600,
  lineHeight: '34px'
})

const AmountLineSub = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  fontSize: 18,
  lineHeight: '28px'
})

const Wrap = styled('div')({
  backgroundColor: PALETTE.SLATE_200,
  overflow: 'hidden'
})

const InvoiceStyles = styled('div')({
  backgroundColor: 'white',
  boxShadow: Elevation.SHEET,
  color: PALETTE.SLATE_700,
  margin: '0 auto',
  maxWidth: 600,
  padding: 16,

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    margin: '32px auto 48px',
    padding: 32
  }
})

const Panel = styled('div')({
  backgroundColor: '#FFFFFF',
  border: `1px solid ${PALETTE.SLATE_500}`,
  borderRadius: 8,
  margin: `16px 0`,
  padding: `12px 0 12px 12px`,
  position: 'relative',

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    margin: `32px 0`,
    padding: `32px 0 32px 32px`
  }
})

const Label = styled('div')({
  color: PALETTE.SLATE_500,
  fontSize: 14,
  fontWeight: 600,
  textTransform: 'uppercase'
})

const Subject = styled('div')({
  fontSize: 32,
  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    fontSize: 34
  }
})

const SectionHeader = styled('div')({
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  marginTop: 12,
  paddingBottom: '.75rem',

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    marginTop: 20
  }
})

const Heading = styled('div')({
  alignItems: 'center',
  display: 'flex',
  fontSize: 18,
  fontWeight: 600,
  justifyContent: 'space-between',
  lineHeight: '24px',
  paddingBottom: 8,
  paddingRight: 12,
  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    fontSize: 24,
    justifyContent: 'flex-start',
    paddingRight: 20
  }
})

const Meta = styled('div')<{isError?: boolean}>(({isError}) => ({
  color: isError ? PALETTE.TOMATO_500 : undefined,
  fontSize: 14
}))

const PayURLText = styled('a')({
  display: 'flex',
  fontSize: 12,
  justifyContent: 'space-between',
  paddingTop: 8,
  width: '100%'
})

const CouponEmphasis = styled('span')({
  color: PALETTE.ROSE_500,
  fontWeight: 600
})

interface Props {
  viewer: Invoice_viewer
}

const Invoice = (props: Props) => {
  const {viewer} = props

  const {invoiceDetails} = viewer
  const endAt = invoiceDetails && invoiceDetails.endAt
  const subject = makeMonthString(endAt)
  useDocumentTitle(`Invoice | ${subject}`, 'Invoices')
  if (!invoiceDetails) return null

  const {
    amountDue,
    total,
    creditCard,
    coupon,
    lines,
    nextPeriodCharges,
    payUrl,
    startAt,
    startingBalance,
    tier
  } = invoiceDetails
  const status = invoiceDetails.status as InvoiceStatusEnum
  const {amount, interval, nextPeriodEnd} = nextPeriodCharges!
  const chargeDates = `${makeDateString(startAt)} to ${makeDateString(endAt)}`
  const nextChargesDates = `${makeDateString(endAt)} to ${makeDateString(nextPeriodEnd)}`
  const amountOff = coupon && (coupon.amountOff || (coupon.percentOff! / 100) * amount)
  const discountedAmount = amountOff && invoiceLineFormat(-amountOff)
  return (
    <Wrap>
      <InvoiceStyles>
        <InvoiceHeader invoice={invoiceDetails} />
        <Panel>
          <InvoiceFailedStamp status={status} />
          <InvoiceTag status={status} />
          <Label>{'Invoice'}</Label>
          <Subject>{subject}</Subject>

          <SectionHeader>
            <Heading>{`Next ${interval}’s usage`}</Heading>
            <Meta>{nextChargesDates}</Meta>
          </SectionHeader>
          <NextPeriodChargesLineItem tier={tier} item={nextPeriodCharges} />

          {/*
            Re: coupon
            Percent-off amounts are based on the nextPeriodCharges,
            so the line item makes more sense close to the starting amount.
            Also, coupons are not part of “Last month’s adjustments”
          */}
          {coupon && (
            <InvoiceLineItemContent
              description={<CouponEmphasis>{`Coupon: “${coupon.name}”`}</CouponEmphasis>}
              amount={<CouponEmphasis>{discountedAmount}</CouponEmphasis>}
            />
          )}

          {lines.length > 0 && (
            <>
              <SectionHeader>
                <Heading>
                  {'Last month’s adjustments'}
                  <EmphasisTag>{'Prorated'}</EmphasisTag>
                </Heading>
                <Meta>{chargeDates}</Meta>
              </SectionHeader>
              {lines.map((item) => (
                <InvoiceLineItem key={item.id} item={item} />
              ))}
            </>
          )}
          <AmountSection>
            {startingBalance !== 0 && (
              <div>
                <AmountLineSub>
                  <div>{'Total'}</div>
                  <div>{invoiceLineFormat(total)}</div>
                </AmountLineSub>
                <AmountLineSub>
                  <div>{'Previous Balance'}</div>
                  <div>{invoiceLineFormat(startingBalance)}</div>
                </AmountLineSub>
              </div>
            )}
            <AmountLine>
              <div>{'Amount due'}</div>
              <div>{invoiceLineFormat(amountDue)}</div>
            </AmountLine>
            {creditCard && (
              <Meta isError={status === 'FAILED'}>
                {chargeStatus[status]}
                {' to '}
                <b>{creditCard.brand}</b> {'ending in '}
                <b>{creditCard.last4}</b>
              </Meta>
            )}
            {status === 'PENDING' && payUrl && (
              <PayURLText href={payUrl} rel='noopener noreferrer' target='_blank'>
                <span>PAY NOW</span>
                <span>{payUrl}</span>
              </PayURLText>
            )}
          </AmountSection>
        </Panel>
        <InvoiceFooter />
      </InvoiceStyles>
    </Wrap>
  )
}

export default createFragmentContainer(Invoice, {
  viewer: graphql`
    fragment Invoice_viewer on User {
      invoiceDetails(invoiceId: $invoiceId) {
        ...InvoiceHeader_invoice
        id
        amountDue
        creditCard {
          brand
          last4
        }
        coupon {
          amountOff
          name
          percentOff
        }
        endAt
        lines {
          ...InvoiceLineItem_item
          id
        }
        nextPeriodCharges {
          ...NextPeriodChargesLineItem_item
          nextPeriodEnd
          interval
          amount
        }
        payUrl
        startingBalance
        startAt
        status
        tier
        total
      }
    }
  `
})
