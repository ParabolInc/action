import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import withAtmosphere, {WithAtmosphereProps} from '../../../decorators/withAtmosphere/withAtmosphere'
import useSubscription from '../../../hooks/useSubscription'
import NotificationSubscription from '../../../subscriptions/NotificationSubscription'
import {LoaderSize} from '../../../types/constEnums'
import renderQuery from '../../../utils/relay/renderQuery'
import UserProfile from './UserProfile'

const query = graphql`
  query UserProfileRootQuery {
    viewer {
      ...UserProfile_viewer
    }
  }
`

interface Props extends WithAtmosphereProps, RouteComponentProps<{teamId: string}> {}

const UserProfileRoot = (props: Props) => {
  const {
    atmosphere,
    match: {
      params: {teamId}
    }
  } = props
  useSubscription('UserProfileRoot', NotificationSubscription)
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(UserProfile, {size: LoaderSize.PANEL})}
    />
  )
}

export default withRouter(withAtmosphere(UserProfileRoot))
