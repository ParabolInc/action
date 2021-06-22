import React from 'react'
import Ellipsis from '../../../../components/Ellipsis/Ellipsis'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV3'

const Hint = styled('div')({
  color: PALETTE.SLATE_600,
  display: 'inline-block',
  fontSize: 13,
  lineHeight: '20px',
  textAlign: 'center'
})
const MeetingFacilitationHint = (props) => {
  const {children} = props
  return (
    <Hint>
      {'('}
      {children}
      <Ellipsis />
      {')'}
    </Hint>
  )
}

export default MeetingFacilitationHint
