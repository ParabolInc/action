import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import GitHubScopingSearchFilterMenu from './GitHubScopingSearchFilterMenu'

const query = graphql`
  query GitHubScopingSearchFilterMenuRootQuery($teamId: ID!, $meetingId: ID!) {
    viewer {
      ...GitHubScopingSearchFilterMenu_viewer
    }
  }
`

interface Props {
  menuProps: MenuProps
  teamId: string
  meetingId: string
}

const GitHubScopingSearchFilterMenuRoot = (props: Props) => {
  // const {menuProps, teamId, meetingId} = props
  const {teamId, meetingId} = props
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      variables={{teamId, meetingId}}
      environment={atmosphere}
      query={query}
      fetchPolicy={'store-or-network' as any}
      // render={({props, error}) => {
      render={() => {
        // const viewer = (props as any)?.viewer ?? null
        // return <GitHubScopingSearchFilterMenu viewer={viewer} error={error} menuProps={menuProps} />
        return <GitHubScopingSearchFilterMenu />
      }}
    />
  )
}

export default GitHubScopingSearchFilterMenuRoot
