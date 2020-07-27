import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import TeamArchive from '../../components/TeamArchive/TeamArchive'
import {LoaderSize} from '../../../../types/constEnums'
import renderQuery from '../../../../utils/relay/renderQuery'
import useAtmosphere from '../../../../hooks/useAtmosphere'

const query = graphql`
  query PersonalTaskArchiveRootQuery($teamId: ID, $first: Int!, $after: DateTime) {
    viewer {
      ...TeamArchive_viewer
    }
  }
`

interface Props {
  teamId?: string
  team?: any
}

const PersonalTaskArchiveRoot = ({teamId, team}: Props) => {
  const atmosphere = useAtmosphere()
  const passDownTeam = team ?? null
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId, first: 40}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(TeamArchive, {
        props: {passDownTeam, showHeader: false},
        size: LoaderSize.PANEL
      })}
    />
  )
}

export default PersonalTaskArchiveRoot
