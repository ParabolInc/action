import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV3'
import React, {ReactNode} from 'react'
import {Breakpoint} from '../../../../types/constEnums'

const Item = styled('div')({
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  display: 'block',
  paddingBottom: 10,
  paddingTop: 10
})

const ItemContent = styled('div')({
  display: 'flex',
  fontSize: 16,
  justifyContent: 'space-between',
  lineHeight: '24px',
  paddingRight: 12,
  width: '100%',

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    paddingRight: 20
  }
})

const Fill = styled('div')({
  flex: 1,
  paddingRight: 16
})

const Amount = styled('div')({
  fontVariantNumeric: 'tabular-nums'
})

interface Props {
  description: ReactNode
  amount: ReactNode
  children?: ReactNode
}

const InvoiceLineItemContent = (props: Props) => {
  const {description, amount, children} = props
  return (
    <Item>
      <ItemContent>
        <Fill>{description}</Fill>
        <Amount>{amount}</Amount>
      </ItemContent>
      {children}
    </Item>
  )
}
export default InvoiceLineItemContent
