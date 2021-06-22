import styled from '@emotion/styled'
import React, {forwardRef} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import Icon from './Icon'

const MenuToggleInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap',
  minWidth: 0
})

const MenuToggleIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  padding: '0 16px'
})

const MenuToggleLabel = styled('div')({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

interface Props {
  label: string
  icon: string
}
const MenuToggleV2Text = forwardRef((props: Props, ref: any) => {
  const {icon, label} = props
  return (
    <MenuToggleInner ref={ref}>
      <MenuToggleIcon>{icon}</MenuToggleIcon>
      <MenuToggleLabel>{label}</MenuToggleLabel>
    </MenuToggleInner>
  )
})

export default MenuToggleV2Text
