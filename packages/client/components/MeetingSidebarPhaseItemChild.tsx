import styled from '@emotion/styled'
import {BezierCurve} from '../types/constEnums'

const MeetingSidebarPhaseItemChild = styled('div')<{
  height: number
}>(({height}) => ({
  display: 'flex',
  flexDirection: 'column',
  height,
  overflow: 'hidden', // required for FF68
  transition: `height 300ms ${BezierCurve.DECELERATE}`
}))

export default MeetingSidebarPhaseItemChild
