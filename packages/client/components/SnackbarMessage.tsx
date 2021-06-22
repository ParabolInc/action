import styled from '@emotion/styled'
import React, {useEffect} from 'react'
import {TransitionStatus} from '../hooks/useTransition'
import {DECELERATE} from '../styles/animation'
import {snackbarShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {Radius, ZIndex} from '../types/constEnums'
import {SnackAction} from './Snackbar'
import SnackbarMessageAction from './SnackbarMessageAction'

interface Props {
  onTransitionEnd: () => void
  message: string
  status: TransitionStatus
  dismissSnack: () => void
  action?: SnackAction
  secondaryAction?: SnackAction
  onMouseEnter: () => void
  onMouseLeave: () => void
}

const Space = styled('div')({
  paddingBottom: 8
})

const Text = styled('div')({
  color: '#FFFFFF',
  fontSize: 14,
  padding: '6px 8px'
})

const MessageStyles = styled('div')<{status: TransitionStatus}>(({status}) => ({
  alignItems: 'center',
  background: PALETTE.SLATE_700,
  borderRadius: Radius.SNACKBAR,
  boxShadow: snackbarShadow,
  display: 'flex',
  padding: 8,
  transition: `all 300ms ${DECELERATE}`,
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  transform: `translateY(${status === TransitionStatus.MOUNTED ? 20 : status === TransitionStatus.EXITING ? -20 : 0
    }px)`,
  pointerEvents: 'auto',
  userSelect: 'none',
  zIndex: ZIndex.SNACKBAR
}))

const useTransitionEnd = (
  timeout: number,
  status: TransitionStatus,
  onTransitionEnd: () => void
) => {
  useEffect(() => {
    setTimeout(onTransitionEnd, timeout)
  }, [status])
}

const SnackbarMessage = (props: Props) => {
  const {
    action,
    secondaryAction,
    status,
    message,
    onTransitionEnd,
    dismissSnack,
    onMouseEnter,
    onMouseLeave
  } = props
  useTransitionEnd(300, status, onTransitionEnd)
  return (
    <Space>
      <MessageStyles
        status={status}
        onClick={dismissSnack}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Text>{message}</Text>
        <SnackbarMessageAction action={action} />
        <SnackbarMessageAction action={secondaryAction} />
      </MessageStyles>
    </Space>
  )
}

export default SnackbarMessage
