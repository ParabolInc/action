import {TaskStatus, TaskStatusLabel} from '../types/constEnums'
import {PALETTE} from '../styles/paletteV3'

export const taskStatusLabels = {
  [TaskStatus.DONE]: TaskStatusLabel.DONE,
  [TaskStatus.ACTIVE]: TaskStatusLabel.ACTIVE,
  [TaskStatus.STUCK]: TaskStatusLabel.STUCK,
  [TaskStatus.FUTURE]: TaskStatusLabel.FUTURE
}

export const taskStatusColors = {
  [TaskStatus.DONE]: PALETTE.GRAPE_600,
  [TaskStatus.ACTIVE]: PALETTE.JADE_400,
  [TaskStatus.STUCK]: PALETTE.TOMATO_500,
  [TaskStatus.FUTURE]: PALETTE.AQUA_400,
  [TaskStatus.ARCHIVED]: PALETTE.SLATE_500,
  [TaskStatus.PRIVATE]: PALETTE.GOLD_300
}
