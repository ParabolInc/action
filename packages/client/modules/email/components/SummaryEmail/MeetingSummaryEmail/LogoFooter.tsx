import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import React from 'react'
import {ExternalLinks} from '../../../../../types/constEnums'

const logoStyle = {
  paddingTop: 64
}

const taglineStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 13,
  paddingTop: 8,
  paddingBottom: 32
}

const LogoFooter = () => {
  return (
    <>
      <tr>
        <td align='center' style={logoStyle}>
          <img crossOrigin='' src={`${ExternalLinks.EMAIL_CDN}mark-color@3x.png`} height='32' width='34' />
        </td>
      </tr>
      <tr>
        <td align='center' style={taglineStyle}>
          {'Crafted with care by the folks at Parabol'}
        </td>
      </tr>
    </>
  )
}

export default LogoFooter
