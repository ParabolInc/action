import generateUID from '../../generateUID'

export type ScheduledJobType = 'MEETING_STAGE_TIME_LIMIT_END'

export default abstract class ScheduledJob {
  id = generateUID()
  protected constructor(public type: ScheduledJobType, public runAt: Date) {}
}
