import EstimateStage from './EstimateStage'
import GenericMeetingPhase from './GenericMeetingPhase'

export default class EstimatePhase extends GenericMeetingPhase {
  stages: EstimateStage[]
  constructor() {
    super('ESTIMATE')
    this.stages = []
  }
}
