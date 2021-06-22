import React from 'react'
import makeDateString from '../../../../utils/makeDateString'
import makeMonthString from '../../../../utils/makeMonthString'
import {Link} from 'react-router-dom'
import invoiceLineFormat from '../../../invoice/helpers/invoiceLineFormat'
import styled from '@emotion/styled'
import Row from '../../../../components/Row/Row'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import Icon from '../../../../components/Icon'
import {PALETTE} from '../../../../styles/paletteV3'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {InvoiceRow_invoice} from '~/__generated__/InvoiceRow_invoice.graphql'

const InvoiceAmount = styled('span')({
  color: PALETTE.SLATE_700,
  fontSize: 16,
  lineHeight: '24px'
})

const FileIcon = styled(Icon)<{isEstimate: boolean}>(({isEstimate}) => ({
  color: isEstimate ? PALETTE.SKY_500 : PALETTE.SLATE_600
}))

const InvoiceInfo = styled(RowInfo)({
  width: '100%'
})

const InvoiceTitle = styled(RowInfoHeading)({
  lineHeight: '24px'
})

const InfoRow = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
})

const InfoRowRight = styled('div')({
  flex: 1,
  justifyContent: 'flex-end',
  textAlign: 'right'
})

const LinkStyles = styled('div')({
  color: PALETTE.SLATE_700,
  alignItems: 'flex-start',
  display: 'flex',
  justifyContent: 'space-between',
  textDecoration: 'none',
  width: '100%'
})

const RowLink = LinkStyles.withComponent(Link)

const StyledDate = styled('span')<{styledToPay?: boolean; styledPaid?: boolean}>(
  ({styledToPay, styledPaid}) => ({
    fontSize: 13,
    color: styledToPay || styledPaid ? PALETTE.SLATE_600 : PALETTE.TOMATO_500
  })
)

const PayURL = styled('a')({
  color: PALETTE.SKY_500,
  fontWeight: 600,
  textDecoration: 'none'
})

interface Props {
  invoice: InvoiceRow_invoice
}
const InvoiceRow = (props: Props) => {
  const {
    invoice: {id: invoiceId, amountDue, creditCard, endAt, paidAt, payUrl, status}
  } = props
  const isEstimate = status === 'UPCOMING'
  return (
    <Row>
      <RowLink rel='noopener noreferrer' target='_blank' to={`/invoice/${invoiceId}`}>
        <FileIcon isEstimate={isEstimate}>receipt</FileIcon>
        <InvoiceInfo>
          <InfoRow>
            <InvoiceTitle>{makeMonthString(endAt)}</InvoiceTitle>
            <InfoRowRight>
              <InvoiceAmount>
                {isEstimate && '*'}
                {invoiceLineFormat(amountDue)}
              </InvoiceAmount>
            </InfoRowRight>
          </InfoRow>
          <InfoRow>
            {status === 'UPCOMING' && (
              <StyledDate styledToPay>
                {isEstimate && '*Current estimate. '}
                {creditCard
                  ? `Card will be charged on ${makeDateString(endAt)}`
                  : `Make sure to add billing info before ${makeDateString(endAt)}!`}
              </StyledDate>
            )}
            {status === 'PAID' && (
              <StyledDate styledPaid>
                {'Paid on '}
                {makeDateString(paidAt)}
              </StyledDate>
            )}
            {status !== 'PAID' && status !== 'UPCOMING' && (
              <StyledDate styledPaid={status === 'PENDING'}>
                {payUrl ? (
                  <PayURL rel='noopener noreferrer' target='_blank' href={payUrl}>
                    {'PAY NOW'}
                  </PayURL>
                ) : (
                  `Status: ${status}`
                )}
              </StyledDate>
            )}
          </InfoRow>
        </InvoiceInfo>
      </RowLink>
    </Row>
  )
}

export default createFragmentContainer(InvoiceRow, {
  invoice: graphql`
    fragment InvoiceRow_invoice on Invoice {
      id
      amountDue
      creditCard {
        brand
      }
      endAt
      paidAt
      payUrl
      status
    }
  `
})
