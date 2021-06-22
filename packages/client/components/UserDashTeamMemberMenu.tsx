import React, {useMemo, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {MenuProps} from '../hooks/useMenu'
import DropdownMenuLabel from './DropdownMenuLabel'
import {UserDashTeamMemberMenu_viewer} from '../__generated__/UserDashTeamMemberMenu_viewer.graphql'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'
import useRouter from '~/hooks/useRouter'
import constructUserTaskFilterQueryParamURL from '~/utils/constructUserTaskFilterQueryParamURL'
import useAtmosphere from '~/hooks/useAtmosphere'
import {UserTaskViewFilterLabels} from '~/types/constEnums'

interface Props {
  menuProps: MenuProps
  viewer: UserDashTeamMemberMenu_viewer | null
}

const UserDashTeamMemberMenu = (props: Props) => {
  const {history} = useRouter()
  const {menuProps, viewer} = props

  const atmosphere = useAtmosphere()
  const {userIds, teamIds, showArchived} = useUserTaskFilters(atmosphere.viewerId)

  const oldTeamsRef = useRef<any>([])
  const nextTeams = viewer?.teams ?? oldTeamsRef.current
  if (nextTeams) {
    oldTeamsRef.current = nextTeams
  }
  const teams = oldTeamsRef.current

  const showAllTeamMembers = !!teamIds
  const {filteredTeamMembers, defaultActiveIdx} = useMemo(() => {
    const filteredTeams = teamIds ? teams.filter(({id: teamId}) => teamIds.includes(teamId)) : teams
    const keySet = new Set()
    const filteredTeamMembers = [] as {
      userId: string
      preferredName: string
    }[]
    const teamMembers = filteredTeams.map(({teamMembers}) => teamMembers.flat()).flat()
    teamMembers.forEach((teamMember) => {
      const userKey = teamMember.userId
      if (!keySet.has(userKey)) {
        keySet.add(userKey)
        filteredTeamMembers.push(teamMember)
      }
    })
    filteredTeamMembers.sort((a, b) => (a.preferredName > b.preferredName ? 1 : -1))
    return {
      filteredTeamMembers,
      defaultActiveIdx: filteredTeamMembers.findIndex((teamMember) => userIds?.includes(teamMember.userId))
        + (showAllTeamMembers ? 2 : 1)
    }
  }, [teamIds, userIds])

  return (
    <Menu
      ariaLabel={'Select the team member to filter by'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by team member:'}</DropdownMenuLabel>
      {showAllTeamMembers &&
        <MenuItem
          key={'teamMemberFilterNULL'}
          label={UserTaskViewFilterLabels.ALL_TEAM_MEMBERS}
          onClick={() => history.push(constructUserTaskFilterQueryParamURL(teamIds, null, showArchived))}
        />}
      {filteredTeamMembers.map((teamMember) => (
        <MenuItem
          key={`teamMemberFilter${teamMember.userId}`}
          dataCy={`team-member-filter-${teamMember.userId}`}
          label={teamMember.preferredName}
          onClick={() => history.push(constructUserTaskFilterQueryParamURL(teamIds, [teamMember.userId], showArchived))}
        />
      ))}
    </Menu>
  )
}

export default createFragmentContainer(UserDashTeamMemberMenu, {
  viewer: graphql`
    fragment UserDashTeamMemberMenu_viewer on User {
      id
      teams {
        id
        name
        teamMembers(sortBy: "preferredName") {
          userId
          preferredName
        }
      }
    }
  `
})
