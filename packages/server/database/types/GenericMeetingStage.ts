import ms from 'ms'
import generateUID from '../../generateUID'

const MAX_SYNC_STAGE_DURATION = ms('1h')

// https://stackoverflow.com/a/20811670/3155110
const filterOutliers = (someArray: number[]) => {
  const values = someArray.concat()
  values.sort(function(a, b) {
    return a - b
  })
  const q1 = values[Math.floor(values.length / 4)]
  const q3 = values[Math.ceil(values.length * (3 / 4))]
  const iqr = q3 - q1

  const maxValue = q3 + iqr * 1.5
  const minValue = q1 - iqr * 1.5
  return values.filter((x) => x <= maxValue && x >= minValue)
}

// allDurations is sorted by age, descending
const getSuggestedDuration = (filteredDurations: number[], allDurations: number[]) => {
  for (let i = 0; i < allDurations.length; i++) {
    const curDur = allDurations[i]
    if (filteredDurations.includes(curDur)) return curDur
  }
  return undefined
}

export default class GenericMeetingStage {
  id = generateUID()
  isAsync: boolean | undefined | null
  isComplete = false
  isNavigable = false
  isNavigableByFacilitator = false
  startAt: Date | undefined = undefined
  endAt: Date | undefined = undefined
  scheduledEndTime: Date | undefined | null
  suggestedEndTime: Date | undefined
  suggestedTimeLimit: number | undefined
  viewCount = 0
  readyToAdvance = [] as string[]

  constructor(public phaseType: string, durations: number[] | undefined) {
    if (durations) {
      const shortDurations = filterOutliers(
        durations.filter((duration) => duration < MAX_SYNC_STAGE_DURATION)
      )
      const longDurations = filterOutliers(
        durations.filter((duration) => duration >= MAX_SYNC_STAGE_DURATION)
      )
      // naively estimate the time limit to be how long it took them last time (ignoring outliers)
      this.suggestedTimeLimit = getSuggestedDuration(shortDurations, durations)
      const longDuration = getSuggestedDuration(longDurations, durations)
      this.suggestedEndTime = longDuration ? new Date(Date.now() + longDuration) : undefined
    }
  }
}
