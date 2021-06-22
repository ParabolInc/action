import CreateAccountSection from 'parabol-client/modules/demo/components/CreateAccountSection'
import React, {CSSProperties} from 'react'
import {Link} from 'react-router-dom'
import {emailPrimaryButtonStyle, emailRuleStyle} from '../../styles'

type SummaryReferrer = 'email' | 'meeting' | 'history'

interface Props {
  isDemo: boolean
  referrer: SummaryReferrer
  teamDashUrl: string
}

const ruleStyle = {
  ...emailRuleStyle,
  width: '100%'
} as CSSProperties

const teamDashLabel = 'Go to Team Dashboard'

const teamDashLinkStyle = {
  ...emailPrimaryButtonStyle,
  fontSize: '14px',
  padding: '6px 0',
  width: '186px'
} as CSSProperties

const SummaryCTA = (props: Props) => {
  const {isDemo, referrer, teamDashUrl} = props
  if (isDemo) {
    return (
      <React.Fragment>
        <hr style={ruleStyle} />
        <CreateAccountSection />
      </React.Fragment>
    )
  }
  if (referrer === 'email') {
    return (
      <a href={teamDashUrl} style={teamDashLinkStyle} title={teamDashLabel}>
        {teamDashLabel}
      </a>
    )
  }
  return (
    <Link to={teamDashUrl} style={teamDashLinkStyle} title={teamDashLabel}>
      {teamDashLabel}
    </Link>
  )
}

export default SummaryCTA
