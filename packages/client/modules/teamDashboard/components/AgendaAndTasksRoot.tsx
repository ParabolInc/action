import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {QueryRenderer} from 'react-relay'
import AgendaAndTasks from './AgendaAndTasks/AgendaAndTasks'
import {LoaderSize} from '../../../types/constEnums'
import renderQuery from '../../../utils/relay/renderQuery'
import useAtmosphere from '../../../hooks/useAtmosphere'

const query = graphql`
  query AgendaAndTasksRootQuery($teamId: ID!) {
    viewer {
      ...AgendaAndTasks_viewer
    }
  }
`

interface Props extends RouteComponentProps<{teamId: string}> {}

const AgendaAndTasksRoot = (props: Props) => {
  const {
    match: {
      params: {teamId}
    }
  } = props
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      render={renderQuery(AgendaAndTasks, {size: LoaderSize.PANEL})}
      fetchPolicy={'store-or-network' as any}
    />
  )
}

export default withRouter(AgendaAndTasksRoot)
