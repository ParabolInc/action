import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {PALETTE} from '~/styles/paletteV3'

const Banner = styled('div')({
  border: `1px dashed ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  display: 'flex',
  fontSize: 14,
  lineHeight: '24px',
  padding: 15, // 16 - 1 (border-widt)
  userSelect: 'none'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  marginRight: 16
})

const Inner = styled('div')({
  fontSize: 'inherit',
  lineHeight: 'inherit'
})

interface Props {
  children: ReactNode
  className?: string
  icon?: string
}

const TipBanner = (props: Props) => {
  const {children, className, icon} = props

  return (
    <Banner className={className}>
      <StyledIcon>{icon || 'info'}</StyledIcon>
      <Inner>{children}</Inner>
    </Banner>
  )
}

export default TipBanner
