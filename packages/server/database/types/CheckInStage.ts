import {CHECKIN} from 'parabol-client/utils/constants'
import GenericMeetingStage from './GenericMeetingStage'

export default class CheckInStage extends GenericMeetingStage {
  constructor(public teamMemberId: string, durations?: number[] | undefined) {
    super(CHECKIN, durations)
  }
}
