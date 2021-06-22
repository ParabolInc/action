import {SuggestedActionInviteYourTeam_suggestedAction} from '../__generated__/SuggestedActionInviteYourTeam_suggestedAction.graphql'
import React, {lazy} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from '../styles/paletteV3'
import SuggestedActionButton from './SuggestedActionButton'
import SuggestedActionCard from './SuggestedActionCard'
import SuggestedActionCopy from './SuggestedActionCopy'
import useModal from '../hooks/useModal'

interface Props {
  suggestedAction: SuggestedActionInviteYourTeam_suggestedAction
}

const AddTeamMemberModal = lazy(() =>
  import(/* webpackChunkName: 'AddTeamMemberModal' */ './AddTeamMemberModal')
)

const TeamName = styled('span')({
  fontWeight: 600
})

const SuggestedActionInviteYourTeam = (props: Props) => {
  const {suggestedAction} = props
  const {id: suggestedActionId, team} = suggestedAction
  const {id: teamId, name: teamName, teamMembers} = team
  const {togglePortal, modalPortal, closePortal} = useModal()
  return (
    <SuggestedActionCard
      backgroundColor={PALETTE.SKY_500}
      iconName='person_add'
      suggestedActionId={suggestedActionId}
    >
      <SuggestedActionCopy>
        {'Invite your teammates to: '}
        <TeamName>{teamName}</TeamName>
      </SuggestedActionCopy>
      <SuggestedActionButton onClick={togglePortal}>Invite Your Teammates</SuggestedActionButton>
      {modalPortal(
        <AddTeamMemberModal closePortal={closePortal} teamId={teamId} teamMembers={teamMembers} />
      )}
    </SuggestedActionCard>
  )
}

export default createFragmentContainer(SuggestedActionInviteYourTeam, {
  suggestedAction: graphql`
    fragment SuggestedActionInviteYourTeam_suggestedAction on SuggestedActionInviteYourTeam {
      id
      team {
        id
        name
        teamMembers {
          ...AddTeamMemberModal_teamMembers
        }
      }
    }
  `
})
