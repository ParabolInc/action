import {ViewerNotOnTeam_viewer} from '../__generated__/ViewerNotOnTeam_viewer.graphql'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Ellipsis from './Ellipsis/Ellipsis'
import PrimaryButton from './PrimaryButton'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import TeamInvitationWrapper from './TeamInvitationWrapper'
import useRouter from '../hooks/useRouter'
import getValidRedirectParam from '../utils/getValidRedirectParam'
import PushInvitationMutation from '../mutations/PushInvitationMutation'
import useEventCallback from '../hooks/useEventCallback'
import useDocumentTitle from '../hooks/useDocumentTitle'

interface Props {
  teamId: string
  viewer: ViewerNotOnTeam_viewer
}

const ViewerNotOnTeam = (props: Props) => {
  const {teamId, viewer} = props
  const {teamInvitation} = viewer
  const atmosphere = useAtmosphere()
  const {authObj} = atmosphere
  const {history} = useRouter()
  useDocumentTitle(`Invitation Required`)
  const handler = useEventCallback((invitation) => {
    const {
      invitation: {token: invitationToken},
      id: notificationId
    } = invitation
    AcceptTeamInvitationMutation(atmosphere, {invitationToken, notificationId}, {history})
  })

  useEffect(() => {
    if (teamInvitation) {
      // if an invitation already exists, accept it
      AcceptTeamInvitationMutation(atmosphere, {invitationToken: teamInvitation.token}, {history})
    } else if (authObj && authObj.tms && authObj.tms.includes(teamId)) {
      // if already on the team, goto team dash
      const redirectTo = getValidRedirectParam()
      const nextRoute = redirectTo || `/team/${teamId}`
      history.replace(nextRoute)
    } else {
      PushInvitationMutation(atmosphere, {teamId})
      atmosphere.eventEmitter.on('inviteToTeam', handler)
      return () => {
        atmosphere.eventEmitter.off('inviteToTeam', handler)
      }
    }
    return undefined
  }, [
    /* eslint-disable-line react-hooks/exhaustive-deps*/
  ])

  if (teamInvitation) {
    return null
  }
  return (
    <TeamInvitationWrapper>
      <InviteDialog>
        <DialogTitle>Invitation Required</DialogTitle>
        <DialogContent>
          <InvitationDialogCopy>You’re almost on the team!</InvitationDialogCopy>
          <InvitationDialogCopy>Just ask a team member for an invitation.</InvitationDialogCopy>
          <InvitationDialogCopy>This page will redirect automatically.</InvitationDialogCopy>
          <InvitationCenteredCopy>
            <PrimaryButton size='medium' waiting>
              <span>Waiting for Invitation</span>
              <Ellipsis />
            </PrimaryButton>
          </InvitationCenteredCopy>
        </DialogContent>
      </InviteDialog>
    </TeamInvitationWrapper>
  )
}

export default createFragmentContainer(ViewerNotOnTeam, {
  viewer: graphql`
    fragment ViewerNotOnTeam_viewer on User {
      teamInvitation(teamId: $teamId) {
        token
      }
    }
  `
})
