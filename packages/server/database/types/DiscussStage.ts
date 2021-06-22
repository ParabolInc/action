import {DISCUSS} from 'parabol-client/utils/constants'
import GenericMeetingStage from './GenericMeetingStage'

export default class DiscussStage extends GenericMeetingStage {
  reflectionGroupId?: string
  constructor(public sortOrder: number, durations: number[] | undefined) {
    super(DISCUSS, durations)
  }
}
