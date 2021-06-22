import {buttonShadow} from 'parabol-client/styles/elevation'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import React from 'react'
import AnchorIfEmail from './AnchorIfEmail'
import {MeetingSummaryReferrer} from './MeetingSummaryEmail'

interface Props {
  referrer: MeetingSummaryReferrer
  isDemo: boolean
  teamDashUrl: string
}

const teamDashLabel = 'Go to Team Dashboard'

const primaryButtonStyle = {
  backgroundColor: PALETTE.TOMATO_500,
  backgroundImage: PALETTE.GRADIENT_TOMATO_600_ROSE_500,
  borderRadius: 32,
  boxShadow: buttonShadow,
  color: '#FFFFFF',
  cursor: 'pointer',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 14,
  fontWeight: 600,
  padding: '9px 20px',
  textDecoration: 'none'
}

const buttonCellStyle = {
  paddingTop: 44
}

const SummarySheetCTA = (props: Props) => {
  const {isDemo, referrer, teamDashUrl} = props
  if (isDemo) return null
  return (
    <tr>
      <td align={'center'} style={buttonCellStyle}>
        <AnchorIfEmail
          isEmail={referrer === 'email'}
          href={teamDashUrl}
          style={primaryButtonStyle}
          title={teamDashLabel}
        >
          {teamDashLabel}
        </AnchorIfEmail>
      </td>
    </tr>
  )
}

export default SummarySheetCTA
