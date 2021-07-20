import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV3'
import {NavSidebar} from '../../../../types/constEnums'

interface Props {
  isComplete: boolean
  isDashboard: boolean
}

const EmptyBlock = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  padding: '8px 8px 0 56px',
  height: NavSidebar.EMPTY_BLOCK_HEIGHT
})

const EmptyMessage = styled('div')({
  color: PALETTE.SLATE_600,
  flex: 1,
  fontSize: 13,
  fontWeight: 400,
  lineHeight: '20px',
  paddingTop: 4
})

const AgendaListEmptyState = (props: Props) => {
  const {isComplete, isDashboard} = props
  const meetingContext = isDashboard ? 'next meeting' : 'meeting'

  if (isComplete) return null
  return (
    <EmptyBlock>
      <EmptyMessage>
        {`Pssst. Add topics for your ${meetingContext}! Use a phrase like “`}
        <b>
          <i>{'upcoming vacation'}</i>
        </b>
        {'.”'}
      </EmptyMessage>
    </EmptyBlock>
  )
}

export default AgendaListEmptyState
