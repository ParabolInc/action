import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'
import {ExternalLinks} from '../types/constEnums'
import {MeetingTypeEnum} from '~/__generated__/NewMeeting_viewer.graphql'
import HowToStepItem from './HowToStepItem'
import IconLabel from './IconLabel'
import LinkButton from './LinkButton'

const STEPS = {
  retrospective: [
    'Write anonymous reflection cards',
    'Drag cards to group common themes',
    'Vote on topics you want to discuss',
    'Create takeaway tasks to make improvements'
  ],
  action: [
    'Add agenda items throughout the week',
    'Update your team on work in progress',
    'Discuss agenda items with your team',
    'Create takeaway tasks to accomplish'
  ],
  poker: [
    'Select stories from your backlog',
    'Invite your team to vote on effort/value',
    'Discuss differences in scores',
    'Export final score to your tracker'
  ]
}

const LINKS = {
  retrospective: ExternalLinks.GETTING_STARTED_RETROS,
  action: ExternalLinks.GETTING_STARTED_CHECK_INS,
  poker: ExternalLinks.GETTING_STARTED_SPRINT_POKER
}

const TITLES = {
  retrospective: 'How to Run a Retro Meeting',
  action: 'How to Run a Check-in Meeting',
  poker: 'How to Run Sprint Poker'
}

const LearnMoreLink = styled(LinkButton)({
  fontSize: 16,
  justifySelf: 'start',
  gridColumnStart: 2,
  paddingBottom: 16
})

const HowToBlock = styled('div')({
  display: 'grid',
  gridColumnGap: 16,
  gridRowGap: 20,
  gridTemplateColumns: '32px'
})

const HowToTitle = styled('div')({
  color: PALETTE.SLATE_700,
  gridColumnStart: 2,
  fontSize: 24,
  fontWeight: 600,
  paddingBottom: 4
})

interface Props {
  meetingType: MeetingTypeEnum
  showTitle?: boolean
}

const NewMeetingHowToSteps = (props: Props) => {
  const {meetingType, showTitle} = props
  const steps = STEPS[meetingType]
  const learnMore = LINKS[meetingType]

  return (
    <HowToBlock>
      {showTitle && <HowToTitle>{TITLES[meetingType]}</HowToTitle>}
      {steps.map((step, idx) => {
        return <HowToStepItem key={idx} number={idx + 1} step={step} />
      })}
      <LearnMoreLink palette='blue' onClick={() => window.open(learnMore, '_blank', 'noreferrer')}>
        <IconLabel icon='open_in_new' iconAfter label='Learn More' />
      </LearnMoreLink>
    </HowToBlock>
  )
}

export default NewMeetingHowToSteps
