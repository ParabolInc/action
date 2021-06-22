import styled from '@emotion/styled'
import React, {ReactNode} from 'react'
import {PALETTE} from '~/styles/paletteV3'

const Header = styled('div')({
  display: 'flex',
  fontSize: 12,
  lineHeight: '12px',
  justifyContent: 'space-between',
  paddingBottom: 8,
  width: '100%'
})

const HeaderDescription = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap'
})

const HeaderName = styled('div')({
  color: PALETTE.SLATE_700,
  fontWeight: 600
})

const HeaderResult = styled('div')({
  color: PALETTE.SLATE_600,
  whiteSpace: 'pre-wrap'
})

interface Props {
  children: ReactNode
  title: string
  subTitle: string
}

const ThreadedItemHeaderDescription = (props: Props) => {
  const {children, title, subTitle} = props
  return (
    <Header>
      <HeaderDescription>
        <HeaderName>{title}</HeaderName>
        <HeaderResult> {subTitle}</HeaderResult>
      </HeaderDescription>
      {children}
    </Header>
  )
}

export default ThreadedItemHeaderDescription
