import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {PALETTE} from '../../../styles/paletteV3'
import {ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember} from '../../../__generated__/ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember.graphql'

const AgendaControl = styled('span')({
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline'
  }
})

interface Props {
  currentMeetingMember: ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember
}

const ActionMeetingUpdatesPromptTeamHelpText = (props: Props) => {
  const {currentMeetingMember} = props
  const atmosphere = useAtmosphere()
  const handleAgendaControl = () => {
    atmosphere.eventEmitter.emit('focusAgendaInput')
  }
  const {teamMember, user} = currentMeetingMember
  const {isConnected} = user
  const {preferredName} = teamMember
  return (
    <span>
      <span>{isConnected === false ? '(' : `(${preferredName} is sharing. `}</span>
      <AgendaControl onClick={handleAgendaControl}>{'Add agenda items'}</AgendaControl>
      {' for discussion.)'}
    </span>
  )
}

export default createFragmentContainer(ActionMeetingUpdatesPromptTeamHelpText, {
  currentMeetingMember: graphql`
    fragment ActionMeetingUpdatesPromptTeamHelpText_currentMeetingMember on ActionMeetingMember {
      user {
        isConnected
      }
      teamMember {
        preferredName
      }
    }
  `
})
