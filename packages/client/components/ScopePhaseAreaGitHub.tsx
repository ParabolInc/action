import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ScopePhaseAreaGitHub_meeting} from '../__generated__/ScopePhaseAreaGitHub_meeting.graphql'
import ScopePhaseAreaAddGitHub from './ScopePhaseAreaAddGitHub'
// import ScopePhaseAreaGitHubScoping from './ScopePhaseAreaGitHubScoping'

const ComingSoon = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%'
})

interface Props {
  isActive: boolean
  gotoParabol: () => void
  meeting: ScopePhaseAreaGitHub_meeting
}

const ScopePhaseAreaGitHub = (props: Props) => {
  const {isActive, gotoParabol, meeting} = props
  const {viewerMeetingMember} = meeting
  if (!viewerMeetingMember || !isActive) return null
  const {teamMember} = viewerMeetingMember
  const {integrations} = teamMember
  console.log({teamMember})
  const hasAuth = integrations?.github?.isActive ?? false
  if (!hasAuth) return <ScopePhaseAreaAddGitHub gotoParabol={gotoParabol} meeting={meeting} />
  return <ComingSoon>Coming Soon!</ComingSoon>
  // return <ScopePhaseAreaGitHubScoping meeting={meeting} />
}

export default createFragmentContainer(ScopePhaseAreaGitHub, {
  meeting: graphql`
    fragment ScopePhaseAreaGitHub_meeting on PokerMeeting {
      ...ScopePhaseAreaAddGitHub_meeting
      ...ScopePhaseAreaGitHubScoping_meeting
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
