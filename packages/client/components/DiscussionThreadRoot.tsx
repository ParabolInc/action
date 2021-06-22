import graphql from 'babel-plugin-relay/macro'
import React, {RefObject} from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import renderQuery from '../utils/relay/renderQuery'
import DiscussionThread from './DiscussionThread'

const query = graphql`
  query DiscussionThreadRootQuery($meetingId: ID!, $threadSourceId: ID!) {
    viewer {
      ...DiscussionThread_viewer
    }
  }
`

interface Props {
  meetingId: string
  meetingContentRef?: RefObject<HTMLDivElement>
  threadSourceId: string
}

const DiscussionThreadRoot = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {meetingContentRef, meetingId, threadSourceId} = props
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{meetingId, threadSourceId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(DiscussionThread, {props: {meetingContentRef, threadSourceId}})}
    />
  )
}

export default DiscussionThreadRoot
