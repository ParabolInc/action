import {TeamInvitationEmailCreateAccount_verifiedInvitation} from '../__generated__/TeamInvitationEmailCreateAccount_verifiedInvitation.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import AuthPrivacyFooter from './AuthPrivacyFooter'
import {meetingTypeToLabel} from '../utils/meetings/lookups'
import useDocumentTitle from '../hooks/useDocumentTitle'

interface Props {
  verifiedInvitation: TeamInvitationEmailCreateAccount_verifiedInvitation
}

const StyledDialog = styled(InviteDialog)({
  maxWidth: 356
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationEmailCreateAccount = (props: Props) => {
  const {verifiedInvitation} = props
  const {meetingType, teamName, teamInvitation} = verifiedInvitation
  useDocumentTitle(`Sign up | Team Invitation`)
  if (!teamInvitation) return null
  const {email} = teamInvitation
  return (
    <StyledDialog>
      <DialogTitle>
        {meetingType ? `Join ${meetingTypeToLabel[meetingType]} Meeting` : 'Join Team'}
      </DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          Choose a password for immediate access
          {meetingType ? ' to the team meeting for: ' : ' to your team: '}
          <TeamName>{teamName}</TeamName>
        </InvitationDialogCopy>
        <InvitationCenteredCopy>
          <EmailPasswordAuthForm email={email} isPrimary />
        </InvitationCenteredCopy>
        <AuthPrivacyFooter />
      </DialogContent>
    </StyledDialog>
  )
}

export default createFragmentContainer(TeamInvitationEmailCreateAccount, {
  verifiedInvitation: graphql`
    fragment TeamInvitationEmailCreateAccount_verifiedInvitation on VerifiedInvitationPayload {
      meetingType
      teamInvitation {
        email
      }
      teamName
    }
  `
})
