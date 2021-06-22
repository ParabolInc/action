import React from 'react'
import Icon from '../../../../components/Icon'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'

const Message = styled('div')({
  padding: '0 16px 16px'
})

const textShadow = '0 1px rgba(0, 0, 0, .15)'
const Inner = styled('div')<{canClose: boolean}>(({canClose}) => ({
  backgroundColor: PALETTE.TOMATO_500,
  borderRadius: 2,
  color: '#FFFFFF',
  display: 'block',
  fontWeight: 600,
  fontSize: 13,
  lineHeight: '18px',
  padding: 15,
  position: 'relative',
  textShadow,
  paddingRight: canClose ? 22 : undefined
}))

const MessageClose = styled('div')({
  cursor: 'pointer',
  fontSize: 0,
  outline: 'none',
  padding: 4,
  position: 'absolute',
  right: 0,
  textShadow,
  top: 0,
  ':hover,:focus': {
    opacity: 0.5
  }
})

const MessageCloseIcon = styled(Icon)({
  color: '#FFFFFF',
  fontSize: ICON_SIZE.MD18
})

interface Props {
  onClose: (...args: any[]) => void
  message: string
}

const OutcomeCardMessage = (props: Props) => {
  const {onClose, message} = props
  return (
    <Message>
      <Inner canClose={!!onClose}>
        {message}
        {onClose && (
          <MessageClose onClick={onClose} tabIndex={0}>
            <MessageCloseIcon>close</MessageCloseIcon>
          </MessageClose>
        )}
      </Inner>
    </Message>
  )
}

export default OutcomeCardMessage
