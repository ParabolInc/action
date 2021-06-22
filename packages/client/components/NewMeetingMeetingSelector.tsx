import styled from '@emotion/styled'
import React from 'react'
import useBreakpoint from '../hooks/useBreakpoint'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {Breakpoint, NewMeeting} from '../types/constEnums'
import {MeetingTypeEnum} from '~/__generated__/NewMeeting_viewer.graphql'
import FloatingActionButton from './FloatingActionButton'
import Icon from './Icon'

interface Props {
  meetingType: MeetingTypeEnum
  idx: number
  setIdx: (idx: number) => void
}

const MeetingSelector = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: isDesktop ? 'center' : 'space-between',
  padding: '0 16px'
}))

const SelectArrow = styled(FloatingActionButton)({
  background: PALETTE.GRAPE_700,
  color: '#fff',
  height: ICON_SIZE.MD40,
  padding: 0,
  width: ICON_SIZE.MD40
})

const MeetingTitle = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  color: PALETTE.GRAPE_700,
  fontSize: isDesktop ? 34 : 27,
  fontWeight: 600,
  minWidth: isDesktop ? NewMeeting.ILLUSTRATION_WIDTH * 0.8 : undefined,
  textAlign: 'center'
}))

const TITLES = {
  retrospective: 'Retro Meeting',
  action: 'Check-in Meeting',
  poker: 'Sprint Poker'
}

const NewMeetingMeetingSelector = (props: Props) => {
  const {idx, setIdx, meetingType} = props
  const title = TITLES[meetingType]
  const onPrevious = () => {
    setIdx(idx - 1)
  }
  const onNext = () => {
    setIdx(idx + 1)
  }
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_SELECTOR)
  return (
    <MeetingSelector isDesktop={isDesktop}>
      <SelectArrow onClick={onPrevious}>
        <Icon>keyboard_arrow_left</Icon>
      </SelectArrow>
      <MeetingTitle isDesktop={isDesktop}>{title}</MeetingTitle>
      <SelectArrow onClick={onNext}>
        <Icon>keyboard_arrow_right</Icon>
      </SelectArrow>
    </MeetingSelector>
  )
}

export default NewMeetingMeetingSelector
