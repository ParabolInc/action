import graphql from 'babel-plugin-relay/macro'
import {
  NewMeetingPhaseTypeEnum,
  fromStageIdToUrl_meeting
} from '~/__generated__/fromStageIdToUrl_meeting.graphql'
import {readInlineData} from 'relay-runtime'
import {RetroDemo} from '../../types/constEnums'
import findStageById from './findStageById'
import getMeetingPathParams from './getMeetingPathParams'
import {phaseTypeToSlug} from './lookups'

const phaseIsMultiStage = {
  checkin: true,
  reflect: false,
  group: false,
  vote: false,
  discuss: true,
  updates: true,
  firstcall: false,
  agendaitems: true,
  lastcall: false,
  SCOPE: false,
  ESTIMATE: true
} as Record<NewMeetingPhaseTypeEnum, boolean>

// I think there's a TS bug where when i make a readonly array of an omit it returns the vals
const fromStageIdToUrl = (stageId: string, meetingRef: any, fallbackStageId: string) => {
  const meeting = readInlineData<fromStageIdToUrl_meeting>(
    graphql`
      fragment fromStageIdToUrl_meeting on NewMeeting @inline {
        phases {
          phaseType
          stages {
            id
          }
        }
      }
    `,
    meetingRef
  )
  const {phases} = meeting
  const stageRes = findStageById(phases, stageId) || findStageById(phases, fallbackStageId)
  if (!stageRes) return '/'
  const {phase, stageIdx} = stageRes
  const {phaseType} = phase
  const phaseSlug = phaseTypeToSlug[phaseType]
  const {meetingId} = getMeetingPathParams()
  if (!meetingId) return '/'
  const isPhaseMultiStage = phaseIsMultiStage[phaseType]
  const maybeStage = isPhaseMultiStage ? `/${stageIdx + 1}` : ''
  if (meetingId === RetroDemo.MEETING_ID) {
    return `/retrospective-demo/${phaseSlug}${maybeStage}`
  }
  return `/meet/${meetingId}/${phaseSlug}${maybeStage}`
}

export default fromStageIdToUrl
