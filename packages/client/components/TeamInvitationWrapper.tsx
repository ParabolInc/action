import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
import Header from './AuthPage/Header'

const PageContainer = styled('div')({
  alignItems: 'center',
  backgroundColor: PALETTE.SLATE_200,
  color: PALETTE.SLATE_700,
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '100%',
  minHeight: '100vh'
})

const CenteredBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'center',
  maxWidth: '100%',
  padding: '2rem 1rem',
  width: '100%'
})

interface Props {
  children: ReactNode
}

function TeamInvitationWrapper(props: Props) {
  const {children} = props
  return (
    <PageContainer>
      <Header />
      <CenteredBlock>{children}</CenteredBlock>
    </PageContainer>
  )
}

export default TeamInvitationWrapper
