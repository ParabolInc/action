import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'

interface Props {
  number: number
  step: string
}

const Number = styled('div')({
  color: '#fff',
  backgroundColor: PALETTE.SLATE_600,
  borderRadius: '100%',
  gridColumn: '1 / 2',
  fontSize: 16,
  fontWeight: 600,
  height: 32,
  lineHeight: '32px',
  textAlign: 'center',
  width: 32
})

const Step = styled('div')({
  alignSelf: 'center',
  gridColumnStart: 2
})

const HowToStepItem = (props: Props) => {
  const {number, step} = props
  return (
    <>
      <Number>{number}</Number>
      <Step>{step}</Step>
    </>
  )
}

export default HowToStepItem
