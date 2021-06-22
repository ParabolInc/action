import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useRouter from '../hooks/useRouter'
import {PALETTE} from '../styles/paletteV3'
import {TeamInvitationGoogleCreateAccount_verifiedInvitation} from '../__generated__/TeamInvitationGoogleCreateAccount_verifiedInvitation.graphql'
import AuthPrivacyFooter from './AuthPrivacyFooter'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import HorizontalSeparator from './HorizontalSeparator/HorizontalSeparator'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  invitationToken: string
  verifiedInvitation: TeamInvitationGoogleCreateAccount_verifiedInvitation
}

const StyledDialog = styled(InviteDialog)({
  maxWidth: 356
})

const StyledContent = styled(DialogContent)({
  paddingLeft: 0,
  paddingRight: 0
})

const CopyMargins = styled('div')({
  padding: '0 1.5rem'
})

const UseEmailFallback = styled(PlainButton)({
  margin: '1rem',
  color: PALETTE.SKY_500
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationGoogleCreateAccount = (props: Props) => {
  const [isEmailFallback, setIsEmailFallback] = useState(false)
  const {match} = useRouter<{token: string}>()
  const {params} = match
  const {token: invitationToken} = params
  const {verifiedInvitation} = props
  const {meetingName, teamInvitation, teamName} = verifiedInvitation

  const useEmail = () => {
    setIsEmailFallback(true)
  }

  useDocumentTitle(`Sign up with Google | Team Invitation`, 'Team Invitation')
  if (!teamInvitation) return null
  const {email} = teamInvitation
  return (
    <StyledDialog>
      <DialogTitle>{meetingName ? `Join ${meetingName}` : 'Join Team'}</DialogTitle>
      <StyledContent>
        <CopyMargins>
          <InvitationDialogCopy>It looks like your email is hosted by Google.</InvitationDialogCopy>
          <InvitationDialogCopy>
            Tap below for immediate access
            {meetingName ? ' to the team meeting for: ' : ' to your team: '}
            <TeamName>{teamName}</TeamName>
          </InvitationDialogCopy>
        </CopyMargins>
        <InvitationCenteredCopy>
          <GoogleOAuthButtonBlock isCreate loginHint={email} invitationToken={invitationToken} />
          {isEmailFallback ? (
            <HorizontalSeparator margin='1rem 0 0' text='or' />
          ) : (
            <UseEmailFallback onClick={useEmail}>Sign up without Google</UseEmailFallback>
          )}
          {isEmailFallback && (
            <EmailPasswordAuthForm email={email} invitationToken={invitationToken} />
          )}
        </InvitationCenteredCopy>
        <AuthPrivacyFooter />
      </StyledContent>
    </StyledDialog>
  )
}

export default createFragmentContainer(TeamInvitationGoogleCreateAccount, {
  verifiedInvitation: graphql`
    fragment TeamInvitationGoogleCreateAccount_verifiedInvitation on VerifiedInvitationPayload {
      meetingName
      teamInvitation {
        email
      }
      teamName
    }
  `
})
