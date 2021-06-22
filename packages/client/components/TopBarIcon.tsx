import React, {forwardRef} from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'
import {PALETTE} from '../styles/paletteV3'

const ButtonIcon = styled(Icon)({})

const Button = styled(PlainButton)({
  cursor: 'pointer',
  padding: '16px 8px',
  position: 'relative'
})

const Badge = styled('div')({
  borderRadius: 10,
  top: 15,
  position: 'absolute',
  left: 22,
  background: PALETTE.ROSE_500,
  border: `1px solid ${PALETTE.GRAPE_700}`,
  // +1 for borders
  width: 9,
  height: 9
})

interface Props {
  icon: string
  onClick?: () => void
  onMouseEnter?: () => void
  hasBadge?: boolean
}

const TopBarIcon = forwardRef((props: Props, ref: any) => {
  const {icon, hasBadge, onClick, onMouseEnter} = props
  return (
    <Button onClick={onClick} ref={ref} onMouseEnter={onMouseEnter}>
      <ButtonIcon>{icon}</ButtonIcon>
      {hasBadge && <Badge />}
    </Button>
  )
})

export default TopBarIcon
