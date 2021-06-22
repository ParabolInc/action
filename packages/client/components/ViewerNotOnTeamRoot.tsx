import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import {LoaderSize} from '../types/constEnums'
import renderQuery from '../utils/relay/renderQuery'
import ViewerNotOnTeam from './ViewerNotOnTeam'

const query = graphql`
  query ViewerNotOnTeamRootQuery($teamId: ID, $meetingId: ID) {
    viewer {
      ...ViewerNotOnTeam_viewer
    }
  }
`

const ViewerNotOnTeamRoot = () => {
  const searchParams = new URLSearchParams(location.search)
  const teamId = searchParams.get('teamId')
  const meetingId = searchParams.get('meetingId')
  const atmosphere = useAtmosphere()
  useSubscription('ViewerNotOnTeamRoot', NotificationSubscription)
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId, meetingId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(ViewerNotOnTeam, {size: LoaderSize.WHOLE_PAGE})}
    />
  )
}

export default ViewerNotOnTeamRoot
