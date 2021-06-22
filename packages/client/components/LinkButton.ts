import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
import BaseButton, {BaseButtonProps} from './BaseButton'

const paletteColors = {
  blue: PALETTE.SKY_500,
  dark: PALETTE.SLATE_700,
  gray: PALETTE.SLATE_200,
  midGray: PALETTE.SLATE_600,
  red: PALETTE.TOMATO_600,
  warm: PALETTE.GOLD_500,
  white: '#FFFFFF'
}

// mix palete color with ~15% black
const hoverColors = {
  blue: PALETTE.SKY_600,
  dark: PALETTE.SLATE_800,
  gray: PALETTE.SLATE_400,
  midGray: PALETTE.SLATE_700,
  red: PALETTE.TOMATO_800,
  warm: PALETTE.GOLD_700,
  white: PALETTE.SLATE_300
}

export interface LinkButtonProps extends BaseButtonProps {
  palette?: keyof typeof paletteColors
}

const LinkButton = styled(BaseButton)<LinkButtonProps>((props) => {
  const {palette = 'dark', disabled, waiting} = props
  const color = paletteColors[palette]
  const hoverColor = hoverColors[palette]
  const visuallyDisabled = disabled || waiting
  return {
    backgroundColor: 'transparent',
    border: 0,
    boxShadow: 'none',
    color,
    padding: 0,
    ':hover,:focus,:active': {
      boxShadow: 'none',
      color: !visuallyDisabled ? hoverColor : undefined
    }
  }
})

export default LinkButton
