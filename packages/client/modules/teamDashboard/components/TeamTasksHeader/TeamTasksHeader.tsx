import {ClassNames} from '@emotion/core'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {NavLink} from 'react-router-dom'
import DashboardAvatars from '~/components/DashboardAvatars/DashboardAvatars'
import AgendaToggle from '~/modules/teamDashboard/components/AgendaToggle/AgendaToggle'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import DashSectionControls from '../../../../components/Dashboard/DashSectionControls'
import DashSectionHeader from '../../../../components/Dashboard/DashSectionHeader'
import DashFilterToggle from '../../../../components/DashFilterToggle/DashFilterToggle'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {PALETTE} from '../../../../styles/paletteV2'
import {Breakpoint} from '../../../../types/constEnums'
import lazyPreload from '../../../../utils/lazyPreload'
import {TeamTasksHeader_team} from '../../../../__generated__/TeamTasksHeader_team.graphql'
import {TeamTasksHeader_viewer} from '../../../../__generated__/TeamTasksHeader_viewer.graphql'
import Checkbox from '../../../../components/Checkbox'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import useAtmosphere from '~/hooks/useAtmosphere'
import setArchivedTasksCheckbox from '~/utils/relay/setArchivedTasksCheckbox'
import LinkButton from '~/components/LinkButton'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const TeamMeta = styled('div')({
  // define
})

const StyledLinkButton = styled(LinkButton)({
  marginLeft: 8,
  color: PALETTE.TEXT_GRAY,
  fontWeight: 600,
  ':hover, :focus, :active': {
    color: PALETTE.TEXT_MAIN
  }
})

const StyledCheckbox = styled(Checkbox)({
  fontSize: ICON_SIZE.MD24,
  marginRight: 8,
  textAlign: 'center',
  userSelect: 'none',
  width: ICON_SIZE.MD24
})

const TeamLinks = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  fontSize: 14,
  justifyContent: 'flex-start',
  lineHeight: '20px',
  maxWidth: '100%',
  overflow: 'auto',
  width: '100%',
  [desktopBreakpoint]: {
    justifyContent: 'flex-start',
    width: 'auto'
  }
})

const DashHeading = styled('div')({
  alignItems: 'center',
  color: PALETTE.TEXT_MAIN,
  display: 'flex',
  fontSize: 24,
  lineHeight: '32px',
  [desktopBreakpoint]: {
    marginBottom: 8
  }
})

const linkStyles = {
  color: PALETTE.LINK_BLUE,
  cursor: 'pointer',
  fontWeight: 600,
  height: 24,
  lineHeight: '24px',
  marginRight: 8,
  outline: 0,
  ':hover, :focus, :active': {
    color: PALETTE.LINK_BLUE_HOVER
  }
}

const secondLink = {
  ...linkStyles,
  marginRight: 0,
  marginLeft: 8
}

const TeamDashTeamMemberMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'TeamDashTeamMemberMenu' */
    '../../../../components/TeamDashTeamMemberMenu'
  )
)

const TeamHeaderAndAvatars = styled('div')({
  borderBottom: `1px solid ${PALETTE.BORDER_DASH_LIGHT}`,
  flexShrink: 0,
  margin: '0 0 16px',
  padding: '0 0 16px',
  width: '100%',
  [desktopBreakpoint]: {
    display: 'flex',
    justifyContent: 'space-between'
  }
})

const AvatarsAndAgendaToggle = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  width: '100%',
  [desktopBreakpoint]: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: 'auto'
  }
})

interface Props {
  team: TeamTasksHeader_team
  viewer: TeamTasksHeader_viewer
}

const TeamTasksHeader = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {team, viewer} = props
  const teamMember = viewer.teamMember!
  const {hideAgenda} = teamMember
  const {
    organization,
    id: teamId,
    name: teamName,
    teamMemberFilter,
    showArchivedTasksCheckbox
  } = team
  const teamMemberFilterName =
    (teamMemberFilter && teamMemberFilter.preferredName) || 'All team members'
  const {name: orgName, id: orgId} = organization
  const {togglePortal, menuProps, originRef, menuPortal} = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })

  return (
    <DashSectionHeader>
      <TeamHeaderAndAvatars>
        <TeamMeta>
          <DashHeading>{teamName}</DashHeading>
          <TeamLinks>
            <ClassNames>
              {({css}) => {
                return (
                  <NavLink
                    className={css(linkStyles)}
                    title={orgName}
                    to={`/me/organizations/${orgId}`}
                  >
                    {orgName}
                  </NavLink>
                )
              }}
            </ClassNames>
            {'•'}
            <ClassNames>
              {({css}) => {
                return (
                  <NavLink
                    className={css(secondLink)}
                    title={'Settings & Integrations'}
                    to={`/team/${teamId}/settings/`}
                  >
                    {'Settings & Integrations'}
                  </NavLink>
                )
              }}
            </ClassNames>
          </TeamLinks>
        </TeamMeta>
        <AvatarsAndAgendaToggle>
          <DashboardAvatars team={team} />
          <AgendaToggle hideAgenda={hideAgenda} teamId={teamId} />
        </AvatarsAndAgendaToggle>
      </TeamHeaderAndAvatars>
      <DashSectionControls>
        {/* Filter by Owner */}
        <DashFilterToggle
          label='Team Member'
          onClick={togglePortal}
          onMouseEnter={TeamDashTeamMemberMenu.preload}
          ref={originRef}
          value={teamMemberFilterName}
        />
        {menuPortal(<TeamDashTeamMemberMenu menuProps={menuProps} team={team} />)}

        <StyledLinkButton
          onClick={() => setArchivedTasksCheckbox(atmosphere, teamId, !showArchivedTasksCheckbox)}
        >
          <StyledCheckbox active={showArchivedTasksCheckbox} />
          {'Show Archived Tasks'}
        </StyledLinkButton>
      </DashSectionControls>
    </DashSectionHeader>
  )
}

export default createFragmentContainer(TeamTasksHeader, {
  team: graphql`
    fragment TeamTasksHeader_team on Team {
      ...DashboardAvatars_team
      id
      name
      organization {
        id
        name
      }
      teamMemberFilter {
        preferredName
      }
      showArchivedTasksCheckbox
      ...TeamDashTeamMemberMenu_team
    }
  `,
  viewer: graphql`
    fragment TeamTasksHeader_viewer on User {
      teamMember(teamId: $teamId) {
        hideAgenda
      }
    }
  `
})
