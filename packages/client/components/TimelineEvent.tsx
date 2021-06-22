import graphql from 'babel-plugin-relay/macro'
import React, {lazy, Suspense} from 'react'
import {createFragmentContainer} from 'react-relay'
import {TimelineEvent_timelineEvent} from '../__generated__/TimelineEvent_timelineEvent.graphql'
import DelayUnmount from './DelayUnmount'
import TimelineEventMock from './TimelineEventMock'

interface Props {
  timelineEvent: TimelineEvent_timelineEvent
}

const lookup = {
  TimelineEventJoinedParabol: lazy(() =>
    import(/* webpackChunkName: 'TimelineEventJoinedParabol' */ './TimelineEventJoinedParabol')
  ),
  TimelineEventTeamCreated: lazy(() =>
    import(/* webpackChunkName: 'TimelineEventTeamCreated' */ './TimelineEventTeamCreated')
  ),
  TimelineEventCompletedRetroMeeting: lazy(() =>
    import(
      /* webpackChunkName: 'TimelineEventCompletedRetroMeeting' */ './TimelineEventCompletedRetroMeeting'
    )
  ),
  TimelineEventPokerComplete: lazy(() =>
    import(
      /* webpackChunkName: 'TimelineEventPokerComplete' */ './TimelineEventPokerComplete'
    )
  ),
  TimelineEventCompletedActionMeeting: lazy(() =>
    import(
      /* webpackChunkName: 'TimelineEventCompletedActionMeeting' */ './TimelineEventCompletedActionMeeting'
    )
  )
}
function TimelineEvent(props: Props) {
  const {timelineEvent} = props
  let AsyncComponent
  if (timelineEvent) {
    const {__typename} = timelineEvent
    AsyncComponent = lookup[__typename]
  }
  return (
    <DelayUnmount unmountAfter={500}>
      <Suspense fallback={<TimelineEventMock />}>
        {AsyncComponent ? <AsyncComponent timelineEvent={timelineEvent} /> : null}
      </Suspense>
    </DelayUnmount>
  )
}

export default createFragmentContainer(TimelineEvent, {
  timelineEvent: graphql`
    fragment TimelineEvent_timelineEvent on TimelineEvent {
      ...TimelineEventJoinedParabol_timelineEvent
      ...TimelineEventTeamCreated_timelineEvent
      ...TimelineEventCompletedRetroMeeting_timelineEvent
      ...TimelineEventCompletedActionMeeting_timelineEvent
      ...TimelineEventPokerComplete_timelineEvent
      __typename
    }
  `
})
