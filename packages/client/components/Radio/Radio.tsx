import React, {Component} from 'react'
import styled from '@emotion/styled'
import ui from '../../styles/ui'
import {PALETTE} from '../../styles/paletteV3'

const Base = styled('label')({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontSize: ui.fieldSizeStyles.medium.fontSize,
  lineHeight: ui.fieldSizeStyles.medium.lineHeight,
  paddingBottom: ui.controlBlockPaddingVertical.medium,
  paddingTop: ui.controlBlockPaddingVertical.medium,
  paddingLeft: ui.controlBlockPaddingHorizontal.medium
})

const Input = styled('input')({
  order: 2
})

const Label = styled('div')({
  order: 3,
  paddingLeft: '.5rem'
})

interface Props {
  checked: boolean
  label: string
  name: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  value: string
}

class Radio extends Component<Props> {
  render() {
    // foce checked to a boolean again because of react bug
    const {checked, name, onChange, label, value} = this.props
    return (
      <Base>
        <Input name={name} type='radio' checked={!!checked} value={value} onChange={onChange} />
        <Label>{label}</Label>
      </Base>
    )
  }
}

export default Radio
