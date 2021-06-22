import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {PALETTE} from '../styles/paletteV3'
import GitHubClientManager from '../utils/GitHubClientManager'
import {ScopePhaseAreaAddGitHub_meeting} from '../__generated__/ScopePhaseAreaAddGitHub_meeting.graphql'
import GitHubSVG from './GitHubSVG'
import RaisedButton from './RaisedButton'

const AddGitHubArea = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  height: '100%'
})

const StyledLink = styled('span')({
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  outline: 0,
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  },
  paddingTop: 24
})

const AddGitHubButton = styled(RaisedButton)({
  whiteSpace: 'pre-wrap'
})
interface Props {
  gotoParabol: () => void
  meeting: ScopePhaseAreaAddGitHub_meeting
}

const ScopePhaseAreaAddGitHub = (props: Props) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const {gotoParabol, meeting} = props
  const {teamId, viewerMeetingMember} = meeting
  if (!viewerMeetingMember) return null
  const {teamMember} = viewerMeetingMember
  const {integrations} = teamMember
  const hasAuth = integrations.github?.isActive ?? false

  const importStories = () => {
    if (!hasAuth) {
      GitHubClientManager.openOAuth(atmosphere, teamId, mutationProps)
    }
  }
  return (
    <AddGitHubArea>
      <AddGitHubButton onClick={importStories} size={'medium'}>
        <GitHubSVG />
        Import stories from GitHub
      </AddGitHubButton>
      <StyledLink onClick={gotoParabol}>Or add new tasks in Parabol</StyledLink>
    </AddGitHubArea>
  )
}

export default createFragmentContainer(ScopePhaseAreaAddGitHub, {
  meeting: graphql`
    fragment ScopePhaseAreaAddGitHub_meeting on PokerMeeting {
      teamId
      viewerMeetingMember {
        teamMember {
          integrations {
            github {
              isActive
            }
          }
        }
      }
    }
  `
})
