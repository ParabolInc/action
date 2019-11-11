import {TeamContainer_viewer} from '../../../../__generated__/TeamContainer_viewer.graphql'
import React, {lazy, Suspense, useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Route} from 'react-router'
import {matchPath, Switch} from 'react-router-dom'
import Team from '../../components/Team/Team'
import useRouter from '../../../../hooks/useRouter'

const AgendaTasks = lazy(() =>
  import(/* webpackChunkName: 'AgendaAndTasksRoot' */ '../../components/AgendaAndTasksRoot')
)
const TeamSettings = lazy(() =>
  import(
    /* webpackChunkName: 'TeamSettingsWrapper' */ '../../components/TeamSettingsWrapper/TeamSettingsWrapper'
  )
)
const ArchivedTasks = lazy(() =>
  import(/* webpackChunkName: 'TeamArchiveRoot' */ '../TeamArchive/TeamArchiveRoot')
)

interface Props {
  teamId: string
  viewer: TeamContainer_viewer
}

const TeamContainer = (props: Props) => {
  const {teamId, viewer} = props
  const {history, match} = useRouter()
  const {location} = window
  const {pathname} = location
  useEffect(() => {
    if (viewer && !viewer.team) {
      history.replace({
        pathname: `/invitation-required/${teamId}`,
        search: `?redirectTo=${encodeURIComponent(pathname)}`
      })
    }
  })
  if (viewer && !viewer.team) return null
  const team = viewer && viewer.team
  const isSettings = Boolean(
    matchPath(pathname, {
      path: '/team/:teamId/settings'
    })
  )
  return (
    <Team isSettings={isSettings} team={team}>
      <Suspense fallback={''}>
        <Switch>
          {/* TODO: replace match.path with a relative when the time comes: https://github.com/ReactTraining/react-router/pull/4539 */}
          <Route exact path={match.path} component={AgendaTasks} />
          <Route path={`${match.path}/settings`} component={TeamSettings} />
          <Route
            path={`${match.path}/archive`}
            render={(p) => <ArchivedTasks {...p} team={team} />}
          />
        </Switch>
      </Suspense>
    </Team>
  )
}

export default createFragmentContainer(TeamContainer, {
  viewer: graphql`
    fragment TeamContainer_viewer on User {
      team(teamId: $teamId) {
        ...Team_team
        ...TeamArchive_team
      }
    }
  `
})
