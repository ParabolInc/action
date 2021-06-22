import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import MyDashboardTasks from './MyDashboardTasks'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'
import UserTasksHeader from '~/modules/userDashboard/components/UserTasksHeader/UserTasksHeader'
import ErrorComponent from './ErrorComponent/ErrorComponent'

const query = graphql`
  query MyDashboardTasksRootQuery($after: DateTime, $userIds: [ID!], $teamIds: [ID!]) {
    viewer {
      ...UserTasksHeader_viewer
      ...MyDashboardTasks_viewer
    }
  }
`

const renderQuery = ({error, retry, props}) => {
  if (error) {
    return <ErrorComponent error={error} eventId={''} />
  }
  if (!props) {
    return <UserTasksHeader viewer={null} />
  }
  return (
    <>
      <UserTasksHeader viewer={props.viewer} />
      <MyDashboardTasks retry={retry!} viewer={props?.viewer ?? null} />
    </>
  )
}

const MyDashboardTasksRoot = () => {
  const atmosphere = useAtmosphere()
  const {userIds, teamIds} = useUserTaskFilters(atmosphere.viewerId)
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{userIds, teamIds}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery}
    />
  )
}

export default MyDashboardTasksRoot
