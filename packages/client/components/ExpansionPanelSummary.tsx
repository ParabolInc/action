import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'

const DropdownIcon = styled(Icon)({
  padding: '8px 0 8px 4px',
  fontSize: ICON_SIZE.MD24
})

const Label = styled('div')({
  alignItems: 'center',
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  display: 'flex',
  fontSize: 14,
  fontWeight: 600,
  justifyContent: 'center',
  ':hover': {
    color: PALETTE.SKY_600
  }
})

interface Props {
  isExpanded: boolean
  onClick: () => void
  label: ReactNode
}

const ExpansionPanelSummary = (props: Props) => {
  const {label, onClick, isExpanded} = props
  return (
    <Label onClick={onClick}>
      {label}
      <DropdownIcon>{isExpanded ? 'unfold_less' : 'unfold_more'}</DropdownIcon>
    </Label>
  )
}

export default ExpansionPanelSummary
