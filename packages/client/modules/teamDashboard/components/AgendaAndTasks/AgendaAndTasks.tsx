import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {AgendaAndTasks_viewer} from '~/__generated__/AgendaAndTasks_viewer.graphql'
import LabelHeading from '~/components/LabelHeading/LabelHeading'
import useStoreQueryRetry from '~/hooks/useStoreQueryRetry'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'

import styled from '@emotion/styled'

import useDocumentTitle from '../../../../hooks/useDocumentTitle'
import {desktopSidebarShadow, navDrawerShadow} from '../../../../styles/elevation'
import {AppBar, Breakpoint, NavSidebar, RightSidebar, ZIndex} from '../../../../types/constEnums'
import TeamColumnsContainer from '../../containers/TeamColumns/TeamColumnsContainer'
import TeamTasksHeaderContainer from '../../containers/TeamTasksHeader/TeamTasksHeaderContainer'
import AgendaListAndInput from '../AgendaListAndInput/AgendaListAndInput'
import CloseAgenda from '../AgendaToggle/CloseAgenda'

const desktopBreakpointMediaQuery = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)
const desktopDashWidestMediaQuery = makeMinWidthMediaQuery(Breakpoint.DASH_BREAKPOINT_WIDEST)

const RootBlock = styled('div')({
  display: 'flex',
  height: '100%',
  width: '100%'
})

const TasksMain = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  [desktopDashWidestMediaQuery]: {
    paddingLeft: NavSidebar.WIDTH,
    paddingRight: RightSidebar.WIDTH
  }
})

const TasksHeader = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  width: '100%'
})

const TasksContent = styled('div')({
  display: 'flex',
  flex: 1,
  height: '100%',
  margin: 0,
  minHeight: 0,
  width: '100%'
})

const AgendaMain = styled('div')<{hideAgenda: boolean | null}>(({hideAgenda}) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: navDrawerShadow,
  display: hideAgenda ? 'none' : 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'fixed',
  right: 0,
  bottom: 0,
  top: AppBar.HEIGHT,
  minWidth: RightSidebar.WIDTH,
  maxWidth: RightSidebar.WIDTH,
  zIndex: ZIndex.SIDE_SHEET, // make sure shadow is above cards
  [desktopBreakpointMediaQuery]: {
    boxShadow: desktopSidebarShadow,
    position: 'relative',
    top: 0
  },
  [desktopDashWidestMediaQuery]: {
    position: 'fixed',
    top: AppBar.HEIGHT
  }
}))

const AgendaHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px 8px 16px 16px'
})

const AgendaContent = styled('div')({
  display: 'flex',
  overflow: 'hidden',
  // padding-bottom makes space for the Start New Meeting FAB
  padding: '0 0 80px',
  height: '100%',
  flexDirection: 'column',
  width: '100%'
})

const StyledLabelHeading = styled(LabelHeading)({
  fontSize: 14,
  textTransform: 'none'
})

interface Props {
  viewer: AgendaAndTasks_viewer
  retry(): void
}

const AgendaAndTasks = (props: Props) => {
  const {viewer, retry} = props
  const {dashSearch} = viewer
  const team = viewer.team!
  const teamMember = viewer.teamMember!
  const {hideAgenda} = teamMember
  const {teamId, teamName} = team
  useStoreQueryRetry(retry)
  useDocumentTitle(`Team Dashboard | ${teamName}`, teamName)
  return (
    <RootBlock>
      {/* Tasks */}
      <TasksMain>
        <TasksHeader>
          <TeamTasksHeaderContainer team={team} viewer={viewer} />
        </TasksHeader>
        <TasksContent>
          <TeamColumnsContainer viewer={viewer} />
        </TasksContent>
      </TasksMain>
      {/* Agenda */}
      <AgendaMain hideAgenda={hideAgenda}>
        {!hideAgenda && (
          <AgendaContent>
            <AgendaHeader>
              <StyledLabelHeading>{'Team Agenda'}</StyledLabelHeading>
              <CloseAgenda hideAgenda={hideAgenda} teamId={teamId} />
            </AgendaHeader>
            <AgendaListAndInput dashSearch={dashSearch || ''} meeting={null} team={team!} />
          </AgendaContent>
        )}
      </AgendaMain>
    </RootBlock>
  )
}
export default createFragmentContainer(AgendaAndTasks, {
  viewer: graphql`
    fragment AgendaAndTasks_viewer on User {
      dashSearch
      team(teamId: $teamId) {
        teamId: id
        teamName: name
        ...AgendaListAndInput_team
        ...TeamTasksHeaderContainer_team
      }
      teamMember(teamId: $teamId) {
        hideAgenda
      }
      ...TeamTasksHeaderContainer_viewer
      ...TeamColumnsContainer_viewer
    }
  `
})
