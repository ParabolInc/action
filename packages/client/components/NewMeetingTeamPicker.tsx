import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import lazyPreload from '../utils/lazyPreload'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import useRouter from '../hooks/useRouter'
import {NewMeetingTeamPicker_teams} from '~/__generated__/NewMeetingTeamPicker_teams.graphql'
import {NewMeetingTeamPicker_selectedTeam} from '~/__generated__/NewMeetingTeamPicker_selectedTeam.graphql'
import NewMeetingDropdown from './NewMeetingDropdown'
import styled from '@emotion/styled'

const SelectTeamDropdown = lazyPreload(() =>
  import(
    /* webpackChunkName: 'SelectTeamDropdown' */
    './SelectTeamDropdown'
  )
)

interface Props {
  selectedTeam: NewMeetingTeamPicker_selectedTeam
  teams: NewMeetingTeamPicker_teams
}

const Dropdown = styled(NewMeetingDropdown)({
  borderRadius: '4px 4px 0 0'
})

const NewMeetingTeamPicker = (props: Props) => {
  const {selectedTeam, teams} = props
  const {history} = useRouter()
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      isDropdown: true
    }
  )
  const {name} = selectedTeam
  const handleSelect = (teamId: string) => {
    history.replace(`/new-meeting/${teamId}`)
  }
  return (
    <>
      <Dropdown
        icon={'group'}
        label={name}
        onClick={togglePortal}
        onMouseEnter={SelectTeamDropdown.preload}
        disabled={teams.length === 0}
        ref={originRef}
      />
      {menuPortal(
        <SelectTeamDropdown menuProps={menuProps} teams={teams} teamHandleClick={handleSelect} />
      )}
    </>
  )
}

export default createFragmentContainer(NewMeetingTeamPicker, {
  selectedTeam: graphql`
    fragment NewMeetingTeamPicker_selectedTeam on Team {
      name
    }
  `,
  teams: graphql`
    fragment NewMeetingTeamPicker_teams on Team @relay(plural: true) {
      ...SelectTeamDropdown_teams
      id
      name
    }
  `
})
