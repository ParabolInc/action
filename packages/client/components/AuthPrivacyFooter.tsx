import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'

const color = PALETTE.SKY_500

const Link = styled('a')({
  color,
  marginTop: '1rem',
  textAlign: 'center',
  ':hover,:focus,:active': {
    color,
    textDecoration: 'underline'
  }
})

const FooterCopy = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 11,
  lineHeight: '24px',
  marginTop: 8,
  textAlign: 'center'
})

const AuthPrivacyFooter = () => (
  <FooterCopy>
    {'By creating an account, you agree to our '}
    <Link
      href='https://www.parabol.co/privacy'
      rel='noopener noreferrer'
      target='_blank'
      title='Privacy Policy'
    >
      {'Privacy Policy'}
    </Link>
    .
  </FooterCopy>
)

export default AuthPrivacyFooter
