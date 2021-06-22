import styled from '@emotion/styled'
import 'emoji-mart/css/emoji-mart.css'
import NimblePicker from 'emoji-mart/dist-modern/components/picker/nimble-picker'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import appleEmojis from 'emoji-mart/data/apple.json'

const TallMenu = styled(Menu)({
  maxHeight: 354
})

interface Props {
  onClick: (emoji) => void
  menuProps: MenuProps
}

const recent = [
  'heart',
  'tada',
  'smile',
  'rocket',
  'fire',
  'white_check_mark',
  'confused',
  'cry',
  'x'
]
const ReactjiPicker = (props: Props) => {
  const {menuProps, onClick} = props
  const {closePortal} = menuProps
  const handleClick = (emoji) => {
    onClick(emoji.id)
    closePortal()
  }
  return (
    <TallMenu ariaLabel='Pick a reactji' {...menuProps}>
      <NimblePicker
        set={'apple'}
        data={appleEmojis}
        color={PALETTE.SKY_500}
        darkMode={false}
        emoji={''}
        native
        onClick={handleClick}
        showPreview={false}
        showSkinTones={false}
        recent={recent}
        style={{borderRadius: 4}}
      />
    </TallMenu>
  )
}

export default ReactjiPicker
