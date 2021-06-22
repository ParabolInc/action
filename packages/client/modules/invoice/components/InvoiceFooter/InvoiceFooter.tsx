import React from 'react'
import parabolMark from '../../../../styles/theme/images/brand/mark-color.svg'
import styled from '@emotion/styled'
import {ContactInfo} from '../../../../types/constEnums'

const Footer = styled('div')({
  textAlign: 'center'
})

const Heading = styled('div')({
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px'
})

const Copy = styled('div')({
  fontSize: 14,
  lineHeight: '20px'
})

const Lockup = styled('img')({
  display: 'block',
  margin: '48px auto 16px',
  width: 64
})

const FinePrint = styled('div')({
  fontSize: 12,
  lineHeight: '1.5',
  margin: '16px auto 0'
})

const InvoiceFooter = () => {
  return (
    <Footer>
      <Heading>{'Thank you for using Parabol!'}</Heading>
      <Copy>
        {'Questions? Concerns?'}
        <br />
        {'Get in touch: '}
        <a href='mailto:billing@parabol.co' title='Contact Us'>
          <b>{ContactInfo.EMAIL_BILLING}</b>
        </a>
      </Copy>
      <Lockup crossOrigin='' alt='Logo for Parabol' src={parabolMark} />
      <FinePrint>
        {'Parabol, Inc.'}
        <br />
        {'2900 W Shorb St'}
        <br />
        {'Alhambra, CA, 91803'}
        <br />
        {'United States'}
        <br />
        <a
          href={`tel:${ContactInfo.TELEPHONE.replace('-', '')}`}
          title={`Call us: ${ContactInfo.TELEPHONE}`}
        >
          {ContactInfo.TELEPHONE}
        </a>
        <br />
        <a href={`mailto:${ContactInfo.EMAIL_LOVE}`} title={`Email us: ${ContactInfo.EMAIL_LOVE}`}>
          {ContactInfo.EMAIL_LOVE}
        </a>
      </FinePrint>
    </Footer>
  )
}

export default InvoiceFooter
