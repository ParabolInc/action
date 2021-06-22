import React from 'react'
import styled from '@emotion/styled'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'

const TipBlock = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_600,
  display: 'flex',
  fontSize: 12,
  lineHeight: '24px'
})

const TipCopy = styled('span')({
  whiteSpace: 'nowrap'
})

const shortcutBlockSize = 20

const ShortcutBlock = styled('div')({
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: Elevation.Z1,
  height: shortcutBlockSize,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '20px',
  margin: '0 .5em',
  textAlign: 'center',
  width: shortcutBlockSize
})

const EditorTip = () => (
  <TipBlock>
    <TipCopy>Press the</TipCopy>
    <ShortcutBlock>?</ShortcutBlock>
    <TipCopy>key for card formatting help</TipCopy>
  </TipBlock>
)

export default EditorTip
