import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import Dashboard from './Dashboard'

const query = graphql`
  query DashboardRootQuery($first: Int!, $after: DateTime) {
    viewer {
      ...Dashboard_viewer
    }
  }
`

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {}

const DashboardRoot = ({atmosphere}: Props) => {
  useSubscription('DashboardRoot', NotificationSubscription)
  useSubscription('DashboardRoot', OrganizationSubscription)
  useSubscription('DashboardRoot', TaskSubscription)
  useSubscription('DashboardRoot', TeamSubscription)
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{first: 5}}
      fetchPolicy={'store-or-network' as any}
      render={({props}) => {
        return <Dashboard viewer={props ? (props as any).viewer : null} />
      }}
    />
  )
}

export default withRouter(withAtmosphere(DashboardRoot))
