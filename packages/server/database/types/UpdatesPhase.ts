import GenericMeetingPhase from './GenericMeetingPhase'
import UpdatesStage from './UpdatesStage'

interface Input {
  durations: number[] | undefined
  stages: UpdatesStage[]
}
export default class UpdatesPhase extends GenericMeetingPhase {
  stages: UpdatesStage[]
  durations: number[] | undefined
  constructor(input: Input) {
    super('updates')
    const {durations, stages} = input
    this.durations = durations
    this.stages = stages
  }
}
