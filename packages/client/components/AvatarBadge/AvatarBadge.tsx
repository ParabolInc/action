import React from 'react'
import {PALETTE} from '../../styles/paletteV3'
import srOnly from '../../styles/helpers/srOnly'
import styled from '@emotion/styled'

const size = 10 // 8 + border

const Badge = styled('div')({
  display: 'block',
  height: size,
  position: 'relative',
  width: size
})

const BadgeDot = styled('div')<{isConnected: boolean}>(({isConnected}) => ({
  backgroundColor: isConnected ? PALETTE.JADE_400 : PALETTE.SLATE_600,
  border: '1px solid rgba(255, 255, 255, .65)',
  borderRadius: size,
  height: size,
  width: size
}))

const Description = styled('div')({
  ...srOnly
})

interface Props {
  isConnected: boolean
}

const AvatarBadge = (props: Props) => {
  const {isConnected} = props
  const connection = isConnected ? 'Online' : 'Offline'
  return (
    <Badge>
      <BadgeDot isConnected={isConnected as boolean} />
      <Description>{connection}</Description>
    </Badge>
  )
}

export default AvatarBadge
