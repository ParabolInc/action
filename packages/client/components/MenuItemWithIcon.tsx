import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import Icon from './Icon'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  paddingLeft: 8,
  paddingRight: 8,
  width: '100%'
})

const ItemIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  padding: 8
})

const Label = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 14,
  lineHeight: '32px'
})

interface Props {
  icon: string
  label: string
  dataCy: string
}

const MenuItemWithIcon = (props: Props) => {
  const {icon, label, dataCy} = props
  return (
    <Wrapper data-cy={`${dataCy}`}>
      <ItemIcon>{icon}</ItemIcon>
      <Label>{label}</Label>
    </Wrapper>
  )
}

export default MenuItemWithIcon
