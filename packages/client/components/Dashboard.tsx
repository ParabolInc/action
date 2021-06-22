import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useBreakpoint from '~/hooks/useBreakpoint'
import useRouter from '~/hooks/useRouter'
import useSnackNag from '~/hooks/useSnackNag'
import React, {lazy} from 'react'
import {createFragmentContainer} from 'react-relay'
import {matchPath, Route, RouteProps, Switch} from 'react-router'
import {Breakpoint} from '~/types/constEnums'
import useSidebar from '../hooks/useSidebar'
import {Dashboard_viewer} from '../__generated__/Dashboard_viewer.graphql'
import DashSidebar from './Dashboard/DashSidebar'
import MobileDashSidebar from './Dashboard/MobileDashSidebar'
import DashTopBar from './DashTopBar'
import MobileDashTopBar from './MobileDashTopBar'
import StartMeetingFAB from './StartMeetingFAB'
import StaticStartMeetingFAB from './StaticStartMeetingFAB'
import SwipeableDashSidebar from './SwipeableDashSidebar'

const UserDashboard = lazy(() =>
  import(
    /* webpackChunkName: 'UserDashboard' */ '../modules/userDashboard/components/UserDashboard/UserDashboard'
  )
)
const TeamRoot = lazy(() =>
  import(/* webpackChunkName: 'TeamRoot' */ '../modules/teamDashboard/components/TeamRoot')
)
const NewTeam = lazy(() =>
  import(
    /* webpackChunkName: 'NewTeamRoot' */ '../modules/newTeam/containers/NewTeamForm/NewTeamRoot'
  )
)

const getShowFAB = (location: NonNullable<RouteProps['location']>) => {
  const {pathname} = location
  return (
    pathname.includes('/me/tasks') ||
    !!matchPath(pathname, {
      path: '/me/',
      exact: true,
      strict: true
    }) ||
    !!matchPath(pathname, {
      path: '/me',
      exact: true,
      strict: true
    }) ||
    !!matchPath(pathname, {
      path: '/team/:teamId',
      exact: true,
      strict: false
    })
  )
}

interface Props {
  viewer: Dashboard_viewer | null
}

const DashLayout = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
  // overflow: 'auto', removed because react-beautiful-dnd only supports 1 scrolling parent
})

const DashPanel = styled('div')({
  display: 'flex',
  flex: 1,
  height: '100%',
  overflow: 'hidden'
})

const DashMain = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  minHeight: 0,
  overflow: 'auto',
  position: 'relative'
})

const Dashboard = (props: Props) => {
  const {viewer} = props
  const {isOpen, toggle, handleMenuClick} = useSidebar()
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {location} = useRouter()
  const overLimitCopy = viewer?.overLimitCopy
  useSnackNag(overLimitCopy)
  return (
    <DashLayout>
      {isDesktop ? (
        <DashTopBar viewer={viewer} toggle={toggle} />
      ) : (
          <MobileDashTopBar viewer={viewer} toggle={toggle} />
        )}
      <DashPanel>
        {isDesktop ? (
          <DashSidebar viewer={viewer} isOpen={isOpen} />
        ) : (
            <SwipeableDashSidebar isOpen={isOpen} onToggle={toggle}>
              <MobileDashSidebar viewer={viewer} handleMenuClick={handleMenuClick} />
            </SwipeableDashSidebar>
          )}
        <DashMain>
          <Switch>
            <Route path='/me' component={UserDashboard} />
            <Route path='/team/:teamId' component={TeamRoot} />
            <Route path='/newteam/:defaultOrgId?' component={NewTeam} />
          </Switch>
        </DashMain>
      </DashPanel>
      {getShowFAB(location) ? isDesktop ? <StaticStartMeetingFAB /> : <StartMeetingFAB /> : null}
    </DashLayout>
  )
}

export default createFragmentContainer(Dashboard, {
  viewer: graphql`
    fragment Dashboard_viewer on User {
      ...MobileDashSidebar_viewer
      ...MobileDashTopBar_viewer
      ...DashTopBar_viewer
      ...DashSidebar_viewer
      overLimitCopy
    }
  `
})
