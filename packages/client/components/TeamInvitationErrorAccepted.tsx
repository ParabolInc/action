import {TeamInvitationErrorAccepted_verifiedInvitation} from '../__generated__/TeamInvitationErrorAccepted_verifiedInvitation.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import StyledLink from './StyledLink'
import {meetingTypeToLabel, meetingTypeToSlug} from '../utils/meetings/lookups'
import useDocumentTitle from '../hooks/useDocumentTitle'

interface Props {
  verifiedInvitation: TeamInvitationErrorAccepted_verifiedInvitation
}

const InlineCopy = styled(InvitationDialogCopy)({
  display: 'inline-block'
})

const TeamInvitationErrorAccepted = (props: Props) => {
  const {verifiedInvitation} = props
  const {meetingType, teamInvitation, teamName} = verifiedInvitation
  useDocumentTitle(`Token already accepted | Team Invitation`)
  if (!teamInvitation || teamName === null) return null
  const {teamId} = teamInvitation
  return (
    <InviteDialog>
      <DialogTitle>Invitation Already Accepted</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          The invitation to {teamName} has already been redeemed.
        </InvitationDialogCopy>
        {meetingType ? (
          <>
            <StyledLink
              to={`/${meetingTypeToSlug[meetingType]}/${teamId}`}
              title={`Join the ${meetingTypeToLabel[meetingType]}`}
            >
              Join the {meetingTypeToLabel[meetingType]} Meeting
            </StyledLink>{' '}
            <InlineCopy>in progress…</InlineCopy>
          </>
        ) : (
          <>
            <InlineCopy>Visit the</InlineCopy>{' '}
            <StyledLink to={`/team/${teamId}`} title='Visit the Team Dashboard'>
              Team Dashboard
            </StyledLink>
          </>
        )}
      </DialogContent>
    </InviteDialog>
  )
}

export default createFragmentContainer(TeamInvitationErrorAccepted, {
  verifiedInvitation: graphql`
    fragment TeamInvitationErrorAccepted_verifiedInvitation on VerifiedInvitationPayload {
      meetingType
      teamName
      teamInvitation {
        teamId
      }
    }
  `
})
