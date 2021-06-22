import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'
import Icon from './Icon'

const Label = styled('span')({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontSize: 15,
  lineHeight: '32px',
  padding: `0 12px`,
  width: '100%'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  paddingRight: 12
})

interface Props {
  icon: string
  label: string
}

const DropdownMenuIconItemLabel = (props: Props) => {
  const {icon, label} = props
  return (
    <Label>
      <StyledIcon>{icon}</StyledIcon>
      {label}
    </Label>
  )
}
export default DropdownMenuIconItemLabel
