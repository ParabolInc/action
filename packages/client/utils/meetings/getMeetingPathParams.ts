/*
 * Avoid this if you can! Everything should be stored under localStage and localPhase already.
 * Grabbing state from the url is non-deterministic depending on when a component updates!
 */
import {matchPath} from 'react-router-dom'
import {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeeting_meeting.graphql'
import findKeyByValue from '../findKeyByValue'
import {phaseTypeToSlug} from './lookups'
import {RetroDemo} from '../../types/constEnums'

interface MeetingPathResults {
  meetingId?: string
  phaseSlug?: string
  phaseType?: NewMeetingPhaseTypeEnum
  stageIdx?: number
  stageIdxSlug?: string
}

interface MeetingParams {
  meetingId: string
  phaseSlug?: string
  stageIdxSlug?: string
}

const getMeetingPathParams = (): MeetingPathResults => {
  const {location} = window
  const {pathname} = location
  const matchRes = matchPath<MeetingParams>(pathname, {
    path: '/meet/:meetingId/:phaseSlug?/:stageIdxSlug?'
  })
  if (!matchRes) {
    const demoMatchRes = matchPath<Omit<MeetingParams, 'meetingId'>>(pathname, {
      path: '/retrospective-demo/:phaseSlug?/:stageIdxSlug?'
    })
    if (!demoMatchRes) return {}
    const {params} = demoMatchRes
    const {phaseSlug, stageIdxSlug} = params
    return {
      meetingId: RetroDemo.MEETING_ID,
      phaseSlug,
      phaseType: findKeyByValue(phaseTypeToSlug, phaseSlug) as NewMeetingPhaseTypeEnum,
      stageIdx: stageIdxSlug ? Number(stageIdxSlug) - 1 : undefined,
      stageIdxSlug
    }
  }
  const {params} = matchRes
  const {meetingId, phaseSlug, stageIdxSlug} = params

  return {
    meetingId,
    phaseSlug: phaseSlug,
    phaseType: findKeyByValue(phaseTypeToSlug, phaseSlug) as NewMeetingPhaseTypeEnum,
    stageIdx: stageIdxSlug ? Number(stageIdxSlug) - 1 : undefined,
    stageIdxSlug
  }
}

export default getMeetingPathParams
