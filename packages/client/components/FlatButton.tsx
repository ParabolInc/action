import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
import {Radius} from '../types/constEnums'
import BaseButton, {BaseButtonProps} from './BaseButton'

const paletteColors = {
  warm: PALETTE.GOLD_500,
  mid: PALETTE.GRAPE_700,
  dark: PALETTE.SLATE_700,
  blue: PALETTE.SKY_500
}

export interface FlatButtonProps extends BaseButtonProps {
  size?: 'small' | 'medium' | 'large'
  children?: ReactNode
  disabled?: boolean
  onClick?: (e: React.MouseEvent) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  palette?: keyof typeof paletteColors
  style?: object
  waiting?: boolean
}

const FlatButton = styled(BaseButton)<FlatButtonProps>((props) => {
  const {palette = 'dark', disabled, waiting} = props
  const visuallyDisabled = disabled || waiting
  return {
    backgroundColor: 'transparent',
    borderRadius: Radius.BUTTON_PILL,
    color: paletteColors[palette],
    outline: 0,
    ':hover,:focus,:active': {
      backgroundColor: !visuallyDisabled ? PALETTE.SLATE_200 : undefined,
      boxShadow: 'none'
    }
  }
})

export default FlatButton
