import styled from '@emotion/styled'
import {ICON_SIZE} from '../styles/typographyV2'

const Icon = styled('i')({
  flexShrink: 0,
  fontFamily: 'Material Icons',
  fontWeight: 'normal',
  fontStyle: 'normal',
  // Preferred icon size (24px)
  fontSize: ICON_SIZE.MD24,
  display: 'inline-block',
  lineHeight: 1,
  textTransform: 'none',
  letterSpacing: 'normal',
  wordWrap: 'normal',
  whiteSpace: 'nowrap',
  direction: 'ltr',
  // Support for all WebKit browsers
  WebkitFontSmoothing: 'antialiased',
  // Support for Safari and Chrome
  textRendering: 'optimizeLegibility',
  // Support for Firefox
  mozOsxFontSmoothing: 'grayscale',
  // Support for IE
  fontFeatureSettings: 'liga'
})

export default Icon
