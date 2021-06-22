import {buttonShadow} from 'parabol-client/styles/elevation'
import {PALETTE} from 'parabol-client/styles/paletteV3'

export const emailBackgroundColor = PALETTE.SLATE_200
export const emailBodyColor = '#FFFFFF'
export const emailFontFamily =
  '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif'
export const emailFontSize = '16px'

export const emailPrimaryButtonStyle = {
  backgroundColor: PALETTE.TOMATO_500,
  backgroundImage: 'linear-gradient(to right, #ED4C56 0, #ED4C86 100%)',
  borderRadius: '4em',
  boxShadow: buttonShadow,
  color: '#FFFFFF',
  cursor: 'pointer',
  display: 'block',
  fontFamily: emailFontFamily,
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: '1.5',
  margin: '0px auto',
  padding: '10px 0px',
  textAlign: 'center',
  textDecoration: 'none',
  width: '128px'
}

export const emailCopyStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: emailFontFamily,
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '1.5',
  margin: '0px 0px 24px',
  padding: '0px',
  textDecoration: 'none'
}

export const emailLineHeight = 1.5

export const emailLinkStyle = {
  color: PALETTE.SKY_500,
  fontFamily: emailFontFamily,
  fontWeight: 600,
  textDecoration: 'none'
}

export const emailInnerMaxWidth = 536
export const emailMaxWidth = 600

export const emailRuleColor = PALETTE.SLATE_300
export const emailRuleHeight = '1px'
export const emailRuleStyle = {
  backgroundColor: PALETTE.SLATE_300,
  border: '0px',
  height: '1px',
  margin: '0 auto'
}

export const emailProductTeamSignature = 'The Parabol Product Team 🙉 🙈 🙊'

export const emailTableBase = {
  borderCollapse: 'collapse',
  borderSpacing: '0px',
  margin: '0px auto',
  width: '100%'
} as const

export const emailTextColor = PALETTE.SLATE_700
export const emailTextColorLight = PALETTE.SLATE_600

export const headCSS = `
  @media only screen and (max-width: 620px) {
    table[class=body] .maxWidthContainer {
      padding: 0 !important;
      width: 100% !important;
    }
  }
`
