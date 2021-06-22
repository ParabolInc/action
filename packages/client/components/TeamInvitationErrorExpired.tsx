import {TeamInvitationErrorExpired_verifiedInvitation} from '../__generated__/TeamInvitationErrorExpired_verifiedInvitation.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import useDocumentTitle from '../hooks/useDocumentTitle'

interface Props {
  verifiedInvitation: TeamInvitationErrorExpired_verifiedInvitation
}

const StyledEmailLink = styled('a')({
  color: PALETTE.SKY_500
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationErrorExpired = (props: Props) => {
  const {verifiedInvitation} = props
  const {teamName, inviterName, inviterEmail} = verifiedInvitation
  useDocumentTitle(`Token Expired | Team Invitation`, 'Team Invitation')
  return (
    <InviteDialog>
      <DialogTitle>Invitation Expired</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          The invitation to <TeamName>{teamName}</TeamName> has expired.
        </InvitationDialogCopy>
        <InvitationDialogCopy>
          Reach out to {inviterName} at{' '}
          <StyledEmailLink href={`mailto:${inviterEmail}`} title={`Email ${inviterEmail}`}>
            {inviterEmail}
          </StyledEmailLink>
        </InvitationDialogCopy>
        <InvitationDialogCopy>to request a new one</InvitationDialogCopy>
      </DialogContent>
    </InviteDialog>
  )
}

export default createFragmentContainer(TeamInvitationErrorExpired, {
  verifiedInvitation: graphql`
    fragment TeamInvitationErrorExpired_verifiedInvitation on VerifiedInvitationPayload {
      teamName
      inviterName
      inviterEmail
    }
  `
})
