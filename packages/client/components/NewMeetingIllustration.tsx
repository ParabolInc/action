import styled from '@emotion/styled'
import React, {Fragment} from 'react'
import SwipeableViews from 'react-swipeable-views'
import {mod} from 'react-swipeable-views-core'
import {virtualize} from 'react-swipeable-views-utils'
import useBreakpoint from '../hooks/useBreakpoint'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {Breakpoint, NewMeeting} from '../types/constEnums'

const MeetingImage = styled('img')({
  width: NewMeeting.ILLUSTRATION_WIDTH
})

interface Props {
  idx: number
  setIdx: (idx: number) => void
  newMeetingOrder: string[]
}

const ILLUSTRATIONS = {
  retrospective: `${__STATIC_IMAGES__}/illustrations/retrospective.svg`,
  action: `${__STATIC_IMAGES__}/illustrations/checkin.svg`,
  poker: `${__STATIC_IMAGES__}/illustrations/sprintPoker.svg`
}

const VirtualizeSwipeableViews = virtualize(SwipeableViews)

const TabContents = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: isDesktop ? 32 : undefined,
  paddingTop: isDesktop ? 16 : undefined
}))

const ImageWithPadding = styled('div')({
  background: '#fff',
  border: `3px solid ${PALETTE.GRAPE_600}`,
  boxShadow: Elevation.Z12,
  borderRadius: '8px',
  display: 'flex',
  height: 300,
  padding: '0 64px'
})

const NewMeetingIllustration = (props: Props) => {
  const {idx, setIdx, newMeetingOrder} = props
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_GRID)
  const slideRenderer = ({index, key}) => {
    const idx = mod(index, newMeetingOrder.length)
    const nextMeetingType = newMeetingOrder[idx]
    const src = ILLUSTRATIONS[nextMeetingType]
    const Wrapper = isDesktop ? ImageWithPadding : Fragment
    return (
      <TabContents isDesktop={isDesktop} key={`${key}-${index}`}>
        <Wrapper>
          <MeetingImage src={src} />
        </Wrapper>
      </TabContents>
    )
  }

  return (
    <VirtualizeSwipeableViews
      enableMouseEvents
      index={idx}
      onChangeIndex={setIdx}
      slideRenderer={slideRenderer}
      // offset the 16px padding from the child for the box shadow
      style={{marginTop: -16}}
    />
  )
}
export default NewMeetingIllustration
