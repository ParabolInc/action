import React from 'react'

import styled from '@emotion/styled'

import {PALETTE} from '../styles/paletteV3'
import Ellipsis from './Ellipsis/Ellipsis'

const CommentingStatus = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_600,
  display: 'flex',
  fontSize: 12,
  height: 36,
  lineHeight: '20px',
  paddingLeft: 48,
  paddingTop: '8px',
  width: '100%'
})

interface Props {
  preferredNames: string[] | null
}

const getStatusText = (preferredNames: string[]) => {
  if (preferredNames && preferredNames.length === 1) {
    return `${preferredNames[0]} is typing`
  } else if (preferredNames && preferredNames.length === 2) {
    return `${preferredNames[0]} and ${preferredNames[1]} are typing`
  } else return `Several people are typing`
}

const CommentingStatusText = (props: Props) => {
  const {preferredNames} = props

  if (!preferredNames || !preferredNames.length) return null

  return (
    <CommentingStatus>
      {getStatusText(preferredNames)}
      <Ellipsis />
    </CommentingStatus>
  )
}

export default CommentingStatusText
