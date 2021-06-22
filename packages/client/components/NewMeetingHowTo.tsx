import React, {useRef, useState} from 'react'
import {MeetingTypeEnum} from '~/__generated__/NewMeeting_viewer.graphql'
import NewMeetingHowToSteps from './NewMeetingHowToSteps'
import styled from '@emotion/styled'
import useBreakpoint from '../hooks/useBreakpoint'
import {BezierCurve, Breakpoint, NewMeeting} from '../types/constEnums'
import ExpansionPanelSummary from './ExpansionPanelSummary'

interface Props {
  meetingType: MeetingTypeEnum
}

const Parent = styled('div')<{isDesktop?: boolean}>(({isDesktop}) => ({
  gridArea: 'howto',
  // make it wider than any child so there's no movement between changes
  minWidth: isDesktop ? NewMeeting.ILLUSTRATION_WIDTH : undefined,
  maxWidth: isDesktop ? undefined : 424,
  margin: isDesktop ? undefined : '0 auto'
}))

const ExpansionPanelBody = styled('div')<{bodyHeight: number}>(({bodyHeight}) => ({
  height: bodyHeight,
  justifyContent: 'center',
  overflow: 'hidden',
  padding: '0 16px',
  transition: `height 600ms ${BezierCurve.DECELERATE}`,
  width: '100%'
}))

const NewMeetingHowTo = (props: Props) => {
  const {meetingType} = props
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_GRID)
  const [bodyHeight, setBodyHeight] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const toggleExpansionPanel = () => {
    const nextHeight = (bodyHeight === 0 && ref.current?.scrollHeight) || 0
    setBodyHeight(nextHeight)
  }
  if (isDesktop) {
    return (
      <Parent isDesktop>
        <NewMeetingHowToSteps meetingType={meetingType} showTitle />
      </Parent>
    )
  }
  return (
    <Parent>
      <ExpansionPanelSummary
        label={'How to Run'}
        onClick={toggleExpansionPanel}
        isExpanded={bodyHeight > 0}
      />
      <ExpansionPanelBody bodyHeight={bodyHeight} ref={ref}>
        <NewMeetingHowToSteps meetingType={meetingType} />
      </ExpansionPanelBody>
    </Parent>
  )
}

export default NewMeetingHowTo
