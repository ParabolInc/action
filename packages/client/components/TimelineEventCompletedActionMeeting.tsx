import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import {RouteComponentProps} from 'react-router'
import relativeDate from '../utils/date/relativeDate'
import plural from '../utils/plural'
import {TimelineEventCompletedActionMeeting_timelineEvent} from '../__generated__/TimelineEventCompletedActionMeeting_timelineEvent.graphql'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props extends RouteComponentProps<{}> {
  timelineEvent: TimelineEventCompletedActionMeeting_timelineEvent
}

const Link = styled(StyledLink)({
  fontWeight: 600
})

const CountItem = styled('span')({
  fontWeight: 600
})

class TimelineEventCompletedActionMeeting extends Component<Props> {
  render() {
    const {timelineEvent} = this.props
    const {meeting, team} = timelineEvent
    const {
      id: meetingId,
      name: meetingName,
      createdAt,
      endedAt,
      agendaItemCount,
      commentCount,
      taskCount
    } = meeting
    const {name: teamName} = team
    const meetingDuration = relativeDate(createdAt, {
      now: endedAt,
      max: 2,
      suffix: false,
      smallDiff: 'less than a minute'
    })
    return (
      <TimelineEventCard
        iconName='change_history'
        timelineEvent={timelineEvent}
        title={
          <TimelineEventTitle>{`${meetingName} with ${teamName} Complete`}</TimelineEventTitle>
        }
      >
        <TimelineEventBody>
          {`It lasted ${meetingDuration} and generated `}
          <CountItem>{`${taskCount} ${plural(taskCount, 'task')}`}</CountItem>
          {', '}
          <CountItem>{`${agendaItemCount} ${plural(agendaItemCount, 'agenda item')}`}</CountItem>
          {' and '}
          <CountItem>{`${commentCount} ${plural(commentCount, 'comment')}.`}</CountItem>
          <br />
          <Link to={`/meet/${meetingId}/agendaitems/1`}>See the discussion</Link>
          {' in your meeting or '}
          <Link to={`/new-summary/${meetingId}`}>review a summary</Link>
        </TimelineEventBody>
      </TimelineEventCard>
    )
  }
}

export default createFragmentContainer(TimelineEventCompletedActionMeeting, {
  timelineEvent: graphql`
    fragment TimelineEventCompletedActionMeeting_timelineEvent on TimelineEventCompletedActionMeeting {
      ...TimelineEventCard_timelineEvent
      id
      type
      meeting {
        id
        agendaItemCount
        commentCount
        createdAt
        endedAt
        name
        taskCount
      }
      team {
        id
        name
      }
    }
  `
})
