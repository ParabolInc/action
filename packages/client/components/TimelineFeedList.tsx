import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createPaginationContainer, RelayPaginationProp} from 'react-relay'
import useLoadMoreOnScrollBottom from '~/hooks/useLoadMoreOnScrollBottom'
import {TimelineFeedList_viewer} from '../__generated__/TimelineFeedList_viewer.graphql'
import TimelineEvent from './TimelineEvent'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

interface Props {
  viewer: TimelineFeedList_viewer
  relay: RelayPaginationProp
}

const TimelineFeedList = (props: Props) => {
  const {relay, viewer} = props
  const {timeline} = viewer
  const lastItem = useLoadMoreOnScrollBottom(relay, {}, 10)
  return (
    <ResultScroller>
      {timeline.edges.map(({node: timelineEvent}) => (
        <TimelineEvent key={timelineEvent.id} timelineEvent={timelineEvent} />
      ))}
      {lastItem}
    </ResultScroller>
  )
}

export default createPaginationContainer(
  TimelineFeedList,
  {
    viewer: graphql`
      fragment TimelineFeedList_viewer on User {
        timeline(first: $first, after: $after) @connection(key: "TimelineFeedList_timeline") {
          edges {
            cursor
            node {
              ...TimelineEvent_timelineEvent
              __typename
              id
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `
  },
  {
    direction: 'forward',
    getConnectionFromProps(props: any) {
      const {viewer} = props
      return viewer && viewer.timeline
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      }
    },
    getVariables(_props, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: count,
        after: cursor
      }
    },
    query: graphql`
      query TimelineFeedListPaginationQuery($first: Int!, $after: DateTime) {
        viewer {
          ...TimelineFeedList_viewer
        }
      }
    `
  }
)
