import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../../../hooks/useAtmosphere'
import renderQuery from '../../../utils/relay/renderQuery'
import MockTemplateList from './MockTemplateList'
import PokerTemplateListOrg from './PokerTemplateListOrg'

const query = graphql`
  query PokerTemplateListOrgRootQuery($teamId: ID!) {
    viewer {
      ...PokerTemplateListOrg_viewer
    }
  }
`

interface Props {
  isActive: boolean
  teamId: string
}

const PokerTemplateListOrgRoot = (props: Props) => {
  const {isActive, teamId} = props
  const atmosphere = useAtmosphere()
  if (!isActive) return null
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(PokerTemplateListOrg, {Loader: <MockTemplateList />})}
    />
  )
}

export default PokerTemplateListOrgRoot
