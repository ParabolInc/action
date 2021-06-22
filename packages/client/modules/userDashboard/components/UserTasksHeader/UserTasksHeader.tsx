import graphql from 'babel-plugin-relay/macro'
import React, {useMemo, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {UserTasksHeader_viewer} from '~/__generated__/UserTasksHeader_viewer.graphql'
import DashSectionControls from '../../../../components/Dashboard/DashSectionControls'
import DashSectionHeader from '../../../../components/Dashboard/DashSectionHeader'
import DashFilterToggle from '../../../../components/DashFilterToggle/DashFilterToggle'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import lazyPreload from '../../../../utils/lazyPreload'
import styled from '@emotion/styled'
import LinkButton from '~/components/LinkButton'
import {PALETTE} from '~/styles/paletteV3'
import Checkbox from '~/components/Checkbox'
import {ICON_SIZE} from '~/styles/typographyV2'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'
import constructUserTaskFilterQueryParamURL from '~/utils/constructUserTaskFilterQueryParamURL'
import useRouter from '~/hooks/useRouter'
import {Breakpoint, UserTaskViewFilterLabels} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import useAtmosphere from '../../../../hooks/useAtmosphere'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const UserDashTeamMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'UserDashTeamMenu' */
    '../../../../components/UserDashTeamMenu'
  )
)

const UserDashTeamMemberMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'UserDashTeamMemberMenu' */
    '../../../../components/UserDashTeamMemberMenu'
  )
)

const StyledDashFilterToggle = styled(DashFilterToggle)({
  margin: '4px 16px 4px 0',
  [desktopBreakpoint]: {
    margin: '0 24px 0 0'
  }
})

const StyledLinkButton = styled(LinkButton)({
  color: PALETTE.SLATE_600,
  flexShrink: 0,
  fontWeight: 600,
  margin: '4px 0',
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  },
  [desktopBreakpoint]: {
    margin: 0
  }
})

const StyledCheckbox = styled(Checkbox)({
  fontSize: ICON_SIZE.MD24,
  marginRight: 8,
  textAlign: 'center',
  userSelect: 'none',
  width: ICON_SIZE.MD24
})

const UserTasksHeaderDashSectionControls = styled(DashSectionControls)({
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
  width: '100%'
})

interface Props {
  viewer: UserTasksHeader_viewer | null
}

const UserTasksHeader = (props: Props) => {
  const {history} = useRouter()
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {viewer} = props
  const {
    menuPortal: teamFilterMenuPortal,
    togglePortal: teamFilterTogglePortal,
    originRef: teamFilterOriginRef,
    menuProps: teamFilterMenuProps
  } = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  const {
    menuPortal: teamMemberFilterMenuPortal,
    togglePortal: teamMemberFilterTogglePortal,
    originRef: teamMemberFilterOriginRef,
    menuProps: teamMemberFilterMenuProps
  } = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  const oldTeamsRef = useRef<any>([])
  const nextTeams = viewer?.teams ?? oldTeamsRef.current
  if (nextTeams) {
    oldTeamsRef.current = nextTeams
  }
  const teams = oldTeamsRef.current
  const {userIds, teamIds, showArchived} = useUserTaskFilters(viewerId)

  const teamFilter = useMemo(() =>
    teamIds ? teams.find(({id: teamId}) => teamIds.includes(teamId)) : undefined
    , [teamIds, teams])

  const teamFilterName = (teamFilter && teamFilter.name) || UserTaskViewFilterLabels.ALL_TEAMS

  const teamMemberFilterName = useMemo(() => {
    const teamMembers = teams.map(({teamMembers}) => teamMembers).flat()
    const users = teamMembers.map(({user}) => user).flat()
    const keySet = new Set()
    const dedupedUsers = [] as {
      id: string
      preferredName: string
      tms: ReadonlyArray<string>
    }[]
    users.forEach((user) => {
      const userKey = user.id
      if (!keySet.has(userKey)) {
        keySet.add(userKey)
        dedupedUsers.push(user)
      }
    })
    const teamMemberFilter = userIds
      ? dedupedUsers.find(({id: userId}) => userIds.includes(userId))
      : undefined
    return teamFilter && teamMemberFilter
      ? teamMemberFilter.tms.includes(teamFilter.id)
        ? teamMemberFilter.preferredName
        : UserTaskViewFilterLabels.ALL_TEAM_MEMBERS
      : teamMemberFilter?.preferredName ?? UserTaskViewFilterLabels.ALL_TEAM_MEMBERS
  }, [teamIds, userIds, teams])

  return (
    <DashSectionHeader>
      <UserTasksHeaderDashSectionControls>
        <StyledDashFilterToggle
          label='Team'
          onClick={teamFilterTogglePortal}
          onMouseEnter={UserDashTeamMenu.preload}
          ref={teamFilterOriginRef}
          value={teamFilterName}
          iconText='group'
          dataCy='team-filter'
        />
        {teamFilterMenuPortal(<UserDashTeamMenu menuProps={teamFilterMenuProps} viewer={viewer} />)}

        {/* Filter by Owner */}
        <StyledDashFilterToggle
          label='Team Member'
          onClick={teamMemberFilterTogglePortal}
          onMouseEnter={UserDashTeamMemberMenu.preload}
          ref={teamMemberFilterOriginRef}
          value={teamMemberFilterName}
          iconText='person'
          dataCy='team-member-filter'
        />
        {teamMemberFilterMenuPortal(
          <UserDashTeamMemberMenu menuProps={teamMemberFilterMenuProps} viewer={viewer} />
        )}

        <StyledLinkButton
          onClick={() =>
            history.push(constructUserTaskFilterQueryParamURL(teamIds, userIds, !showArchived))
          }
          dataCy='archived-checkbox'
        >
          <StyledCheckbox active={showArchived} />
          {'Archived'}
        </StyledLinkButton>
      </UserTasksHeaderDashSectionControls>
    </DashSectionHeader>
  )
}

export default createFragmentContainer(UserTasksHeader, {
  viewer: graphql`
    fragment UserTasksHeader_viewer on User {
      id
      ...UserDashTeamMenu_viewer
      ...UserDashTeamMemberMenu_viewer
      teams {
        id
        name
        teamMembers(sortBy: "preferredName") {
          user {
            id
            preferredName
            tms
          }
        }
      }
    }
  `
})
