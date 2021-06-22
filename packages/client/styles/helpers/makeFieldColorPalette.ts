import {PALETTE} from '../paletteV3'
import {Radius} from '../../types/constEnums'
import makePlaceholderStyles from './makePlaceholderStyles'

const fieldPalettes = {
  // emphasize fields e.g. agenda input
  cool: {
    backgroundColor: '#FFFFFF',
    borderColor: 'transparent',
    color: PALETTE.SLATE_700,
    focusBorderColor: PALETTE.SKY_500,
    placeholder: makePlaceholderStyles(PALETTE.SKY_500),
    placeholderColorFocusActive: makePlaceholderStyles(PALETTE.SKY_500),
    selection: PALETTE.SLATE_300
  },
  // all fields
  white: {
    backgroundColor: '#FFFFFF',
    borderColor: PALETTE.SLATE_500,
    color: PALETTE.SLATE_700,
    focusBorderColor: PALETTE.SLATE_700,
    placeholder: makePlaceholderStyles(PALETTE.SLATE_600),
    placeholderColorFocusActive: makePlaceholderStyles(PALETTE.SLATE_400),
    selection: PALETTE.SLATE_300
  }
}

export default function makeFieldColorPalette(
  colorPalette,
  hasPseudoClassStyles = true,
  customStyles = {}
) {
  const defaultCustomStyles = {
    base: {},
    placeholder: {},
    selection: {},
    hover: {},
    focus: {},
    active: {},
    ...customStyles
  }
  const {base, placeholder, selection, hover, focus, active} = defaultCustomStyles
  const hoverFocusActive = {
    borderColor: fieldPalettes[colorPalette].focusBorderColor,
    outline: 'none'
  }
  const pseudoClassStyles = {
    ':hover': {
      ...hoverFocusActive,
      ...hover
    },
    ':focus': {
      ...hoverFocusActive,
      ...focus
    },
    ':active': {
      ...hoverFocusActive,
      ...active
    }
  }
  const addPsuedoClassStyles = hasPseudoClassStyles && pseudoClassStyles
  return {
    backgroundColor: fieldPalettes[colorPalette].backgroundColor,
    borderColor: fieldPalettes[colorPalette].borderColor,
    borderRadius: Radius.FIELD,
    color: fieldPalettes[colorPalette].color,
    ...base,
    ...fieldPalettes[colorPalette].placeholder,
    ...placeholder,

    '::selection': {
      backgroundColor: fieldPalettes[colorPalette].selection,
      ...selection
    },
    ...addPsuedoClassStyles,
    ...customStyles
  }
}
