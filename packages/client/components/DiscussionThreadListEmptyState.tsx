import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import TangledArrowSVG from './TangledArrowSVG'
import EmptyDiscussionSVG from './EmptyDiscussionSVG'

const DiscussionThreadEmptyStateRoot = styled('div')({
  padding: 24,
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0
})

const EmptyDiscussionContainer = styled('div')({
  width: 260,
  margin: '14px auto'
})

const TangledArrowContainer = styled('div')({
  width: 76,
  margin: '48px auto 0px auto'
})

const Message = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  textAlign: 'center',
  lineHeight: '20px',
  margin: '24 0'
})

interface Props {
  isReadOnly?: boolean
  allowTasks: boolean
}

const DiscussionThreadListEmptyState = (props: Props) => {
  const {isReadOnly, allowTasks} = props
  const readOnlyMessage = allowTasks
    ? 'No comments or tasks were added here'
    : 'No comments were added here'
  const message = `Start the conversation${
    allowTasks ? ' or add takeaway task cards' : ''
  } to capture next steps.`

  return (
    <DiscussionThreadEmptyStateRoot>
      <EmptyDiscussionContainer>
        <EmptyDiscussionSVG />
      </EmptyDiscussionContainer>
      <Message>{isReadOnly ? readOnlyMessage : message}</Message>
      {!isReadOnly && (
        <TangledArrowContainer>
          <TangledArrowSVG />
        </TangledArrowContainer>
      )}
    </DiscussionThreadEmptyStateRoot>
  )
}

export default DiscussionThreadListEmptyState
