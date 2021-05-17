import EstimateUserScore from './EstimateUserScore'
import GenericMeetingStage from './GenericMeetingStage'
import {TaskServiceEnum} from './Task'

interface Input {
  creatorUserId: string
  service: TaskServiceEnum
  serviceTaskId: string
  sortOrder: number
  durations: number[] | undefined
  dimensionRefIdx: number
  scores?: EstimateUserScore[]
  finalScore?: number
}

export default class EstimateStage extends GenericMeetingStage {
  creatorUserId: string
  service: TaskServiceEnum
  serviceTaskId: string
  sortOrder: number
  dimensionRefIdx: number
  finalScore?: number
  scores: EstimateUserScore[]
  isVoting: boolean
  constructor(input: Input) {
    super('ESTIMATE', input.durations)
    const {creatorUserId, service, serviceTaskId, sortOrder, scores, dimensionRefIdx} = input
    this.creatorUserId = creatorUserId
    this.service = service
    this.serviceTaskId = serviceTaskId
    this.sortOrder = sortOrder
    this.scores = scores || []
    this.isNavigable = true
    this.isNavigableByFacilitator = true
    this.isVoting = true
    this.dimensionRefIdx = dimensionRefIdx
  }
}
