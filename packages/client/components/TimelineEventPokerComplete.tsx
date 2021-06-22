import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import plural from '../utils/plural'
import {TimelineEventPokerComplete_timelineEvent} from '../__generated__/TimelineEventPokerComplete_timelineEvent.graphql'
import CardsSVG from './CardsSVG'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventPokerComplete_timelineEvent
}

const CountItem = styled('span')({
  fontWeight: 600
})

const Link = styled(StyledLink)({
  fontWeight: 600
})

const TimelineEventPokerComplete = (props: Props) => {
  const {timelineEvent} = props
  const {meeting, team} = timelineEvent
  const {id: meetingId, name: meetingName, commentCount, phases} = meeting
  const {name: teamName} = team
  const estimatePhase = phases.find((phase) => phase.phaseType === 'ESTIMATE')!
  const stages = estimatePhase.stages!
  const storyCount = new Set(stages.map(({serviceTaskId}) => serviceTaskId)).size
  return (
    <TimelineEventCard
      IconSVG={<CardsSVG />}
      timelineEvent={timelineEvent}
      title={<TimelineEventTitle>{`${meetingName} with ${teamName} Complete`}</TimelineEventTitle>}
    >
      <TimelineEventBody>
        {'You voted on '}
        <CountItem>
          {storyCount} {plural(storyCount, 'story', 'stories')}
        </CountItem>
        {' and added '}
        <CountItem>
          {commentCount} {plural(commentCount, 'comment')}
        </CountItem>
        {'.'}
        <br />
        <Link to={`/meet/${meetingId}/estimate/1`}>See the estimates</Link>
        {' in your meeting or '}
        <Link to={`/new-summary/${meetingId}`}>review a summary</Link>
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default createFragmentContainer(TimelineEventPokerComplete, {
  timelineEvent: graphql`
    fragment TimelineEventPokerComplete_timelineEvent on TimelineEventPokerComplete {
      ...TimelineEventCard_timelineEvent
      id
      meeting {
        id
        commentCount
        name
        phases {
          phaseType
          ... on EstimatePhase {
            stages {
              id
              serviceTaskId
            }
          }
        }
      }
      team {
        id
        name
      }
    }
  `
})
