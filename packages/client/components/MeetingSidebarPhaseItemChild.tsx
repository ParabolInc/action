import styled from '@emotion/styled'
import {BezierCurve} from '../types/constEnums'

const MeetingSidebarPhaseItemChild = styled('div')<{height?: string | number}>(({height}) => ({
  display: 'flex',
  flexDirection: 'column',
  transition: `height 300ms ${BezierCurve.DECELERATE}`,
  height, // trickle down height for overflow
  overflow: 'hidden' // required for FF68
}))

export default MeetingSidebarPhaseItemChild
