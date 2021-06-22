import CardsSVG from '../../components/CardsSVG'
import {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeetingSidebar_meeting.graphql'
import {ACTION, RETROSPECTIVE} from '../constants'

/* Used by the server! cannot convert to enums yet */

/* These are the labels show to the viewer */
export const phaseLabelLookup = {
  checkin: 'Icebreaker',
  reflect: 'Reflect',
  group: 'Group',
  vote: 'Vote',
  discuss: 'Discuss',
  updates: 'Solo Updates',
  firstcall: 'First Call',
  agendaitems: 'Team Agenda',
  lastcall: 'Last Call',
  SUMMARY: 'Summary',
  SCOPE: 'Scope',
  ESTIMATE: 'Estimate'
} as Record<NewMeetingPhaseTypeEnum, string>

export const phaseIconLookup = {
  checkin: 'group',
  reflect: 'edit',
  group: 'group_work',
  vote: 'thumbs_up_down',
  discuss: 'comment',
  updates: 'update',
  firstcall: 'comment',
  agendaitems: 'comment',
  lastcall: 'comment',
  SUMMARY: 'receipt',
  SCOPE: 'playlist_add'
} as Record<NewMeetingPhaseTypeEnum, string>

export const phaseImageLookup = {
  ESTIMATE: CardsSVG
}
export const meetingTypeToIcon = {
  [RETROSPECTIVE]: 'history',
  [ACTION]: 'change_history',
  poker: CardsSVG
} as const

export const phaseTypeToSlug = {
  checkin: 'checkin',
  reflect: 'reflect',
  group: 'group',
  vote: 'vote',
  discuss: 'discuss',
  updates: 'updates',
  firstcall: 'firstcall',
  agendaitems: 'agendaitems',
  lastcall: 'lastcall',
  SUMMARY: 'summary',
  SCOPE: 'scope',
  ESTIMATE: 'estimate'
} as Record<NewMeetingPhaseTypeEnum, string>
