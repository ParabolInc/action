import styled from '@emotion/styled'
import React, {useEffect, useRef, useState} from 'react'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'
import getTeamIdFromPathname from '~/utils/getTeamIdFromPathname'
import {BezierCurve, ZIndex} from '../types/constEnums'
import FloatingActionButton from './FloatingActionButton'
import Icon from './Icon'

const Block = styled('div')({
  position: 'fixed',
  bottom: 16,
  right: 16,
  // hacky, but we need the FAB to show up over the team right nav
  zIndex: ZIndex.SIDE_SHEET
})

const Button = styled(FloatingActionButton)({
  color: '#fff',
  backgroundImage: PALETTE.GRADIENT_TOMATO_600_ROSE_500,
  height: 56,
  padding: 0,
  overflow: 'hidden',
  zIndex: ZIndex.FAB
})

const MeetingIcon = styled(Icon)<{isExpanded: boolean}>(({isExpanded}) => ({
  padding: 16,
  paddingLeft: isExpanded ? 24 : 16,
  paddingRight: 16,
  transition: `all 300ms ${BezierCurve.DECELERATE}`
}))

const MeetingLabel = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  fontSize: 16,
  fontWeight: 600,
  textAlign: 'start',
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  transform: `translateX(${isExpanded ? '-4px' : '158px'})`,
  width: isExpanded ? 158 : 0
}))

interface Props { }

const StartMeetingFAB = (props: Props) => {
  const { } = props
  const teamId = getTeamIdFromPathname()
  const {history} = useRouter()
  const [isBig, setIsBig] = useState(true)
  const hoverTimerId = useRef<number | undefined>()
  const initTimerId = useRef<number | undefined>()

  useEffect(() => {
    initTimerId.current = window.setTimeout(() => {
      setIsBig(false)
    }, 10000)
    return () => {
      window.clearTimeout(initTimerId.current)
      window.clearTimeout(hoverTimerId.current)
    }
  }, [])

  const onMouseEnter = () => {
    hoverTimerId.current = window.setTimeout(() => {
      setIsBig(true)
    }, 500)
  }
  const onMouseLeave = () => {
    window.clearTimeout(hoverTimerId.current)
    setIsBig(false)
  }
  const onClick = () => {
    history.push(`/new-meeting/${teamId}`)
  }
  return (
    <Block>
      <Button onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <MeetingIcon isExpanded={isBig}>{'forum'}</MeetingIcon>
        <MeetingLabel isExpanded={isBig}>{'Start New Meeting'}</MeetingLabel>
      </Button>
    </Block>
  )
}

export default StartMeetingFAB
