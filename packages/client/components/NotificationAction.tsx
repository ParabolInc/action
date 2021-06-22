import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'
import PlainButton from './PlainButton/PlainButton'

const Button = styled(PlainButton)({
  color: PALETTE.SKY_500,
  padding: 0,
  paddingLeft: 8
})

interface Props {
  label: string
  onClick(): void
}

const NotificationAction = (props: Props) => {
  const {label, onClick} = props
  return <Button onClick={onClick}>{label}</Button>
}

export default NotificationAction
