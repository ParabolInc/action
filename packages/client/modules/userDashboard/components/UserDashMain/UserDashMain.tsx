import React, {lazy, Suspense} from 'react'
import {Route, RouteComponentProps, Switch} from 'react-router'
import DashContent from '~/components/Dashboard/DashContent'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'
import {LoaderSize} from '../../../../types/constEnums'

interface Props extends RouteComponentProps<{}> {}

const UserTaskViewRoot = lazy(() =>
  import(
    /* webpackChunkName: 'MyDashboardTasksRoot' */ '../../../../components/UserTaskViewRoot'
  )
)
const MyDashboardTimelineRoot = lazy(() =>
  import(
    /* webpackChunkName: 'MyDashboardTimelineRoot' */ '../../../../components/MyDashboardTimelineRoot'
  )
)

const UserDashMain = (props: Props) => {
  const {match} = props
  return (
    <DashContent>
      <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.PANEL} />}>
        <Switch>
          <Route path={`${match.url}/tasks`} component={UserTaskViewRoot} />
          <Route path={match.url} component={MyDashboardTimelineRoot} />
        </Switch>
      </Suspense>
    </DashContent>
  )
}

export default UserDashMain
