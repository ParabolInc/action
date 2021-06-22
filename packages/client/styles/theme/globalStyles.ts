import {makePlaceholderStylesString} from '../helpers/makePlaceholderStyles'
import fontLoader from './fontLoader'
import {FONT_FAMILY} from '../typographyV2'
import {PALETTE} from '../paletteV3'

const placeholderStyles = makePlaceholderStylesString(PALETTE.SLATE_600)

const fontFaceDefinitions = fontLoader
  .map(
    (fontFace) => `
    @font-face {
      font-family: "${fontFace.fontFamily}";
      src: ${fontFace.src};
      font-style: ${fontFace.fontStyle};
      font-weight: ${fontFace.fontWeight};
      font-stretch: ${fontFace.fontStretch};
      font-display: ${fontFace.fontDisplay};
    }
  `
  )
  .join('\n')

// bg is important since we do a slide up animation we don't want the background to slide up, too
// I dislike overflow immensely, but required to
// 1) not have a bunch of white space below the app on mobile
// 2) prevent a horizontal scrollbar from causing a vertical scrollbar due to the 100vh
const root = `
  #root {
    background: ${PALETTE.SLATE_200};
    margin: 0;
    height: 100vh;
    padding: 0;
    width: 100%
  }
`
const draftStyles = `
  .draft-blockquote {
    font-style: italic;
    border-left: 2px ${PALETTE.SLATE_500} solid;
    margin 8px 0;
    padding 0 8px;
  }

  .draft-codeblock {
    background-color: ${PALETTE.SLATE_200};
    border-left: 2px ${PALETTE.SLATE_500} solid;
    border-radius: 1px;
    font-family: ${FONT_FAMILY.MONOSPACE};
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
    padding: 0 8px;
  }
`

export default `
  * {
    box-sizing: border-box;
  }

  *::before, *::after {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
  }

  body {
    color: ${PALETTE.SLATE_700};
    font-family: ${FONT_FAMILY.SANS_SERIF};
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    font-size: 16px;
    font-weight: 400;
    line-height: normal;
    margin: 0;
    padding: 0;
  }

  ${root}

  a {
    color: ${PALETTE.SLATE_700};
    text-decoration: none;
  }

  a:hover; a:focus {
    color: ${PALETTE.GRAPE_700};
    text-decoration: none;
  }

  input {
    font-family: ${FONT_FAMILY.SANS_SERIF};
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
  }

  textarea {
    font-family: ${FONT_FAMILY.SANS_SERIF};
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
  }
  img {
    max-width: 100%;
  }

  p {
    margin: 0;
  }

  pre {
    max-width: 100%;
    overflow: auto;
  }

  b {
    font-weight: 600;
  }

  strong {
    font-weight: 600;
  }

  /*::-webkit-scrollbar {
    -webkit-appearance: none;
    width:6px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius:3px;
    background-color:rgba(0, 0, 0, 0.3);
  }

  ::-webkit-scrollbar-thumb:hover {
    background:rgba(0, 0, 0, 0.5);
  }

  ::-webkit-scrollbar-thumb:window-inactive {
    background:rgba(0, 0, 0, 0.2);
  }*/

  @media print {
    html,
    body {
      font-size: 14px !important;
    }
    .hide-print {
      display: none !important;
    }
  }

  ${draftStyles}

  ${placeholderStyles}

  ${fontFaceDefinitions}
`
