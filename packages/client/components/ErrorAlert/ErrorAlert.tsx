/**
 * A message container used to alert the user to an error.
 * Looks something like:
 *   [ (!) Your Message Here ]
 *
 */
import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV3'
import {Radius} from '../../types/constEnums'
import Icon from '../Icon'
import {ICON_SIZE} from '../../styles/typographyV2'

interface Props {
  message: string
}

const ErrorAlertWrapper = styled('div')({
  backgroundColor: PALETTE.TOMATO_100,
  borderRadius: Radius.TOOLTIP,
  display: 'flex',
  alignItems: 'center',
  fontSize: 14,
  marginBottom: 16,
  padding: '8px 16px'
})

const SpacedIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  marginRight: 8
})

const ErrorAlert = ({message}: Props) => {
  return (
    <ErrorAlertWrapper role='alert'>
      <SpacedIcon>warning</SpacedIcon>
      <span>{message}</span>
    </ErrorAlertWrapper>
  )
}

export default ErrorAlert
