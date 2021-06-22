import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import React from 'react'
import {MeetingSummaryReferrer} from './MeetingSummaryEmail'

const bannerLink = {
  color: `${PALETTE.SLATE_600} !important`,
  cursor: 'pointer',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: '11px',
  fontWeight: 400,
  paddingBottom: 16,
  textDecoration: 'underline'
}

interface Props {
  referrer: MeetingSummaryReferrer
  referrerUrl?: string
}

const ViewInBrowserHeader = (props: Props) => {
  const {referrer, referrerUrl} = props
  if (referrer !== 'email') return null
  return (
    <table align='center' width='100%'>
      <tbody>
        <tr>
          <td align='center'>
            <a href={referrerUrl} style={bannerLink}>
              {'View this in your browser'}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default ViewInBrowserHeader
