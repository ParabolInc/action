import EmailBorderBottom from '../../email/components/SummaryEmail/MeetingSummaryEmail/EmailBorderBottom'
import {emailFontFamily, emailPrimaryButtonStyle, emailTableBase} from '../../email/styles'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {ExternalLinks, LocalStorageKey} from '~/types/constEnums'

const tableStyle = {
  ...emailTableBase,
  width: '100%'
} as React.CSSProperties

const textStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: emailFontFamily
} as React.CSSProperties
const headingStyle = {
  ...textStyle,
  fontSize: 24,
  fontWeight: 600,
  paddingTop: 24
} as React.CSSProperties
const copyStyle = {
  ...textStyle,
  fontSize: 16,
  paddingTop: 4
} as React.CSSProperties
const subHeadingStyle = {
  ...textStyle,
  fontWeight: 600,
  fontSize: 16,
  paddingTop: 24
} as React.CSSProperties

const primaryButtonStyle = {
  ...emailPrimaryButtonStyle,
  width: '320px'
} as React.CSSProperties
const iconSize = 40
const labelWidth = 298
const featureWidth = iconSize + labelWidth
const featureTableStyle = {
  ...tableStyle,
  width: featureWidth
} as React.CSSProperties
const featureIconCellStyle = {
  height: iconSize,
  padding: '6px 0',
  width: iconSize
} as React.CSSProperties
const featureIconStyle = {
  display: 'block',
  height: iconSize,
  width: iconSize
} as React.CSSProperties
const featureCopyCellStyle = {
  fontSize: 16,
  height: iconSize,
  padding: '6px 0 6px 18px',
  textAlign: 'left',
  width: 280
} as React.CSSProperties

const buttonCellStyle = {
  paddingTop: 24
} as React.CSSProperties

const features = [
  {icon: 'feature-prompts@3x.png', copy: 'Custom retrospective formats'},
  {icon: 'feature-grouping@3x.png', copy: 'Realtime group participation'},
  {icon: 'feature-summary@3x.png', copy: 'Detailed meeting summary email'},
  {icon: 'feature-owners@3x.png', copy: 'Takeaway tasks with owners'}
]

const makeFeatureRow = (featureIconFile, featureCopy, idx) => {
  const src = `${ExternalLinks.EMAIL_CDN}${featureIconFile}`
  return (
    <tr key={`feature${idx}`}>
      <td style={featureIconCellStyle} width={iconSize}>
        <img crossOrigin='' height={iconSize} src={src} style={featureIconStyle} width={iconSize} />
      </td>
      <td style={featureCopyCellStyle} width={labelWidth}>
        {featureCopy}
      </td>
    </tr>
  )
}

const CreateAccountSection = (props) => {
  const {isDemo, dataCy} = props
  if (!isDemo) return null
  const isLoggedIn = localStorage.getItem(LocalStorageKey.APP_TOKEN_KEY)
  const primaryActionLabel = isLoggedIn ? 'Go to My Dashboard' : 'Create a Free Account'
  const primaryActionLink = isLoggedIn ? '/me' : '/create-account?from=demo'
  const copyLineOne = isLoggedIn
    ? 'Head on over to your dashboard'
    : 'In just a few seconds you’ll have access'
  const copyLineTwo = isLoggedIn ? (
    <span>
      to run <b>a real retrospective</b> with your team.
    </span>
  ) : (
    <span>
      to run <b>unlimited retrospectives</b> with your team.
    </span>
  )
  return (
    <>
      <tr data-cy={dataCy}>
        <td style={headingStyle} align='center'>
          {'Thanks for playing!'}
        </td>
      </tr>
      <tr data-cy={dataCy}>
        <td align='center' style={copyStyle}>
          {copyLineOne}
        </td>
      </tr>
      <tr data-cy={dataCy}>
        <td align='center' style={copyStyle}>
          {copyLineTwo}
        </td>
      </tr>
      <tr data-cy={dataCy}>
        <td style={buttonCellStyle}>
          <a
            data-cy='create-account'
            href={primaryActionLink}
            style={primaryButtonStyle}
            title={primaryActionLabel}
          >
            {primaryActionLabel}
          </a>
        </td>
      </tr>
      <tr data-cy={dataCy}>
        <td align='center' style={subHeadingStyle}>
          {'The Parabol Difference'}
        </td>
      </tr>
      <tr data-cy={dataCy}>
        <td>
          <table style={featureTableStyle} width={featureWidth}>
            <tbody>{features.map(({icon, copy}, idx) => makeFeatureRow(icon, copy, idx))}</tbody>
          </table>
        </td>
      </tr>
      <EmailBorderBottom dataCy={dataCy} />
    </>
  )
}

export default CreateAccountSection
