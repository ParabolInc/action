import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'

const Wrapper = styled('div')({
  alignItems: 'center',
  background: PALETTE.SLATE_600,
  borderRadius: 4,
  color: '#fff',
  display: 'flex',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  marginBottom: 8,
  maxHeight: 28,
  padding: '4px 16px'
})

interface Props {
  isComplete: boolean
}

const PhaseCompleteTag = (props: Props) => {
  const {isComplete} = props
  if (!isComplete) return null
  return <Wrapper>Phase Completed</Wrapper>
}

export default PhaseCompleteTag
