import styled from '@emotion/styled'
import React from 'react'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'
import getTeamIdFromPathname from '~/utils/getTeamIdFromPathname'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {Breakpoint, Layout, ZIndex} from '../types/constEnums'
import FloatingActionButton from './FloatingActionButton'
import Icon from './Icon'

const Block = styled('div')({
  position: 'fixed',
  bottom: 16,
  right: 16,
  // hacky, but we need the FAB to show up over the team right nav
  zIndex: ZIndex.SIDE_SHEET,
  [makeMinWidthMediaQuery(Breakpoint.DASH_BREAKPOINT_WIDEST)]: {
    // this will work until we scope the FAB to dashboard main container
    right: `calc(((100vw - ${Layout.TASK_COLUMNS_MAX_WIDTH}px) / 2) + 16px)`
  }
})

const Button = styled(FloatingActionButton)({
  color: '#fff',
  backgroundImage: PALETTE.GRADIENT_TOMATO_600_ROSE_500,
  height: 56,
  padding: 0,
  overflow: 'hidden',
  zIndex: ZIndex.FAB
})

const MeetingIcon = styled(Icon)({
  padding: 16,
  paddingLeft: 24,
  paddingRight: 16
})

const MeetingLabel = styled('div')({
  fontSize: 16,
  fontWeight: 600,
  textAlign: 'start',
  width: 158
})

interface Props { }

const StartMeetingFAB = (props: Props) => {
  const { } = props
  const teamId = getTeamIdFromPathname()
  const {history} = useRouter()
  const onClick = () => {
    history.push(`/new-meeting/${teamId}`)
  }
  return (
    <Block>
      <Button onClick={onClick}>
        <MeetingIcon>{'forum'}</MeetingIcon>
        <MeetingLabel>{'Start New Meeting'}</MeetingLabel>
      </Button>
    </Block>
  )
}

export default StartMeetingFAB
