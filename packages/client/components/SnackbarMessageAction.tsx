import React from 'react'
import {SnackAction} from './Snackbar'
import styled from '@emotion/styled'
import PlainButton from './PlainButton/PlainButton'
import {PALETTE} from '../styles/paletteV3'
import {DECELERATE} from '../styles/animation'

interface Props {
  action: SnackAction | null | undefined
}

const Action = styled(PlainButton)({
  borderRadius: 2,
  color: PALETTE.ROSE_500,
  fontSize: 14,
  fontWeight: 600,
  marginLeft: 8,
  padding: 8,
  transition: `background 100ms ${DECELERATE}`,
  ':hover,:focus,:active': {
    backgroundColor: '#ffffff0e'
  }
})

const SnackbarMessageAction = (props: Props) => {
  const {action} = props
  if (!action) return null
  const {label, callback} = action
  return <Action onClick={callback}>{label}</Action>
}

export default SnackbarMessageAction
