import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import React from 'react'
import {ExternalLinks} from '../../../../../types/constEnums'

interface Props {
  emailCSVUrl: string
}

const label = 'Export to CSV'

const iconLinkLabel = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: '13px',
  paddingTop: 32
}

const imageStyle = {
  paddingRight: 8,
  verticalAlign: 'middle'
}

const EmailExportCSVButton = (props: Props) => {
  const {emailCSVUrl} = props
  return (
    <tr>
      <td align='center' style={iconLinkLabel} width='100%'>
        <a href={emailCSVUrl} title={label}>
          <img
            crossOrigin=''
            alt={label}
            src={`${ExternalLinks.EMAIL_CDN}cloud_download.png`}
            style={imageStyle}
          />
          {label}
        </a>
      </td>
    </tr>
  )
}

export default EmailExportCSVButton
