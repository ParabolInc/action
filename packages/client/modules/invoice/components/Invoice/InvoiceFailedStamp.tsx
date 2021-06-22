import React from 'react'
import {InvoiceStatusEnum} from '~/__generated__/InvoiceRow_invoice.graphql'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint} from '../../../../types/constEnums'

const FailedStamp = styled('div')({
  color: PALETTE.TOMATO_600,
  fontSize: 40,
  fontWeight: 600,
  left: '50%',
  opacity: 0.5,
  // don't let it cover up any buttons
  pointerEvents: 'none',
  position: 'absolute',
  textAlign: 'center',
  textTransform: 'uppercase',
  top: '50%',
  transform: 'translate3d(-50%, -50%, 0) rotate(-30deg)',
  width: '100%',

  [`@media (min-width: ${Breakpoint.INVOICE}px)`]: {
    fontSize: 48
  }
})

interface Props {
  status: InvoiceStatusEnum
}
const InvoiceFailedStamp = (props: Props) => {
  const {status} = props
  if (status !== 'FAILED') return null

  return <FailedStamp>{'Payment Failed'}</FailedStamp>
}

export default InvoiceFailedStamp
