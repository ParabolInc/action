import convertToTaskContent from 'parabol-client/utils/draftjs/convertToTaskContent'
import {makeCheckinGreeting, makeCheckinQuestion} from 'parabol-client/utils/makeCheckinGreeting'
import CheckInStage from './CheckInStage'
import GenericMeetingPhase from './GenericMeetingPhase'

interface Input {
  teamId: string
  meetingCount: number
  stages: CheckInStage[]
}
export default class CheckInPhase extends GenericMeetingPhase {
  checkInGreeting: {content: string; language: string}
  checkInQuestion: string
  stages: CheckInStage[]

  constructor(input: Input) {
    super('checkin')
    const {teamId, meetingCount, stages} = input
    this.checkInGreeting = makeCheckinGreeting(meetingCount, teamId)
    this.checkInQuestion = convertToTaskContent(makeCheckinQuestion(meetingCount, teamId))
    this.stages = stages
  }
}
