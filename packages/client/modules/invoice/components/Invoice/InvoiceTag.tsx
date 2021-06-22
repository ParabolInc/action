import React from 'react'
import {InvoiceStatusEnum} from '~/__generated__/InvoiceRow_invoice.graphql'
import styled from '@emotion/styled'
import {Breakpoint} from '../../../../types/constEnums'
import {PALETTE} from '../../../../styles/paletteV3'
import BaseTag from '../../../../components/Tag/BaseTag'

const TagBlock = styled('div')({
  position: 'absolute',
  right: 12,
  top: 12,
  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    right: 20,
    top: 20
  }
})

const StyledBaseTag = styled(BaseTag)({
  backgroundColor: PALETTE.SLATE_200,
  color: PALETTE.SLATE_700
})

const lookup = {
  PENDING: {
    label: 'Payment Processing'
  },
  UPCOMING: {
    label: 'Current Estimation'
  }
} as const

interface Props {
  status: InvoiceStatusEnum
}
const InvoiceTag = (props: Props) => {
  const {status} = props
  if (status !== 'UPCOMING' && status !== 'PENDING') return null
  const {label} = lookup[status]
  return (
    <TagBlock>
      <StyledBaseTag>{label}</StyledBaseTag>
    </TagBlock>
  )
}

export default InvoiceTag
