import styled from '@emotion/styled'
import React, {useState} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import BasicTextArea from './InputField/BasicTextArea'
import PrimaryButton from './PrimaryButton'

interface Props {
  closePortal: () => void
  eventId: string
}

const INVITE_DIALOG_BREAKPOINT = 864
const INVITE_DIALOG_MEDIA_QUERY = `@media (min-width: ${INVITE_DIALOG_BREAKPOINT}px)`

const StyledDialogContainer = styled(DialogContainer)({
  width: 480
})

const StyledDialogTitle = styled(DialogTitle)({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    fontSize: 24,
    lineHeight: '32px',
    marginBottom: 8,
    paddingLeft: 32,
    paddingTop: 24
  }
})

const StyledDialogContent = styled(DialogContent)({
  display: 'flex',
  flexDirection: 'column',
  [INVITE_DIALOG_MEDIA_QUERY]: {
    padding: '16px 32px 32px'
  }
})

const ButtonGroup = styled('div')({
  marginTop: '24px',
  display: 'flex',
  justifyContent: 'flex-end'
})

const Description = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 14,
  lineHeight: 1.5,
  paddingLeft: 24,
  [INVITE_DIALOG_MEDIA_QUERY]: {
    paddingLeft: 32
  }
})

const ReportErrorFeedback = (props: Props) => {
  const {closePortal, eventId} = props
  const [text, setText] = useState('')
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value
    setText(nextValue)
  }

  const onSubmit = () => {
    const dsn = window.__ACTION__.sentry
    const url = `https://sentry.io/api/embed/error-page/?dsn=${dsn}&eventId=${eventId}`
    if (!text) return
    const body = new URLSearchParams()
    body.set('comments', text)
    body.set('name', 'user')
    body.set('email', 'errors@parabol.co')
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body
    })
    closePortal()
  }

  return (
    <StyledDialogContainer>
      <StyledDialogTitle>Report Error</StyledDialogTitle>
      <Description>What were you doing when the error happened?</Description>
      <StyledDialogContent>
        <BasicTextArea autoFocus name='errorReport' onChange={onChange} value={text} />
        <ButtonGroup>
          <PrimaryButton onClick={onSubmit} disabled={text.length === 0} size='medium'>
            {'Submit Report'}
          </PrimaryButton>
        </ButtonGroup>
      </StyledDialogContent>
    </StyledDialogContainer>
  )
}

export default ReportErrorFeedback
