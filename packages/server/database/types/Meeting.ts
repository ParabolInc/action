import generateUID from '../../generateUID'
import GenericMeetingPhase from './GenericMeetingPhase'

export type MeetingTypeEnum = 'poker' | 'retrospective' | 'action'

interface Input {
  teamId: string
  meetingType: MeetingTypeEnum
  meetingCount: number
  name?: string
  phases: GenericMeetingPhase[]
  facilitatorUserId: string
  showConversionModal?: boolean
}

const namePrefix = {
  action: 'Check-in',
  retrospective: 'Retro'
} as Record<MeetingTypeEnum, string>
export default class Meeting {
  id = generateUID()
  isLegacy?: boolean // true if old version of action meeting
  createdAt = new Date()
  updatedAt = new Date()
  createdBy: string
  endedAt: Date | undefined | null = undefined
  facilitatorStageId: string
  facilitatorUserId: string
  meetingCount: number
  meetingNumber: number
  name: string
  summarySentAt: Date | undefined = undefined
  teamId: string
  meetingType: MeetingTypeEnum
  phases: GenericMeetingPhase[]
  showConversionModal?: boolean

  constructor(input: Input) {
    const {
      teamId,
      facilitatorUserId,
      meetingCount,
      meetingType,
      name,
      phases,
      showConversionModal
    } = input
    this.createdBy = facilitatorUserId
    this.facilitatorStageId = phases[0].stages[0].id
    this.facilitatorUserId = facilitatorUserId
    this.meetingCount = meetingCount
    this.meetingNumber = meetingCount + 1
    this.meetingType = meetingType
    this.name = name ?? `${namePrefix[meetingType]} #${this.meetingNumber}`
    this.phases = phases
    this.teamId = teamId
    this.showConversionModal = showConversionModal
  }
}
