import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV3'
import {TaskStatus} from '../../../../types/constEnums'

const taskStatusColors = {
  [TaskStatus.DONE]: PALETTE.GRAPE_600,
  [TaskStatus.ACTIVE]: PALETTE.JADE_400,
  [TaskStatus.STUCK]: PALETTE.TOMATO_500,
  [TaskStatus.FUTURE]: PALETTE.AQUA_400,
  [TaskStatus.ARCHIVED]: PALETTE.SLATE_500,
  [TaskStatus.PRIVATE]: PALETTE.GOLD_300
}

const OutcomeCardStatusIndicator = styled('div')<{status: string}>(({status}) => ({
  backgroundColor: taskStatusColors[status],
  borderRadius: 4,
  height: 4,
  marginRight: 4,
  width: 32
}))

export default OutcomeCardStatusIndicator
