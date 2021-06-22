import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {LoaderSize} from '../types/constEnums'
import renderQuery from '../utils/relay/renderQuery'
import MyDashboardTimeline from './MyDashboardTimeline'

const query = graphql`
  query MyDashboardTimelineRootQuery($first: Int!, $after: DateTime, $userIds: [ID!]) {
    viewer {
      ...MyDashboardTimeline_viewer
    }
  }
`

interface Props extends WithAtmosphereProps {}

const MyDashboardTimelineRoot = ({atmosphere}: Props) => {
  const {viewerId} = atmosphere
  return (
    <QueryRenderer
      environment={atmosphere}
      variables={{first: 10, userIds: [viewerId]}}
      query={query}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(MyDashboardTimeline, {size: LoaderSize.PANEL})}
    />
  )
}

export default withAtmosphere(MyDashboardTimelineRoot)
