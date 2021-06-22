import {TASK_MAX_CHARS} from '../utils/constants'
import {compositeIdRegex, emailRegex, idRegex} from './regex'
import linkify from '../utils/linkify'

export const avatar = {
  size: (value) =>
    value.int('Hey! Don’t monkey with that!').test((raw) => {
      if (raw > 1024 * 1024) {
        return `File too large! It must be <${1024}kB`
      }
      return undefined
    }),
  type: (value) => value.matches(/image\/.+/, 'File must be an image')
}

export const compositeId = (value) => value.matches(compositeIdRegex)

export const id = (value) => value.matches(idRegex)

export const requiredId = (value) => value.required().matches(idRegex)

export const makeInviteeTemplate = (inviteEmails, teamMemberEmails, pendingApprovalEmails = []) => {
  return (value) =>
    value
      .trim()
      .required('You should enter an email here.')
      .matches(emailRegex, 'That doesn’t look like an email address.')
      .test((inviteTeamMember) => {
        return inviteEmails.includes(inviteTeamMember) && 'That person has already been invited!'
      })
      .test(
        (inviteTeamMember) =>
          teamMemberEmails.includes(inviteTeamMember) && 'That person is already on your team!'
      )
      .test(
        (inviteTeamMember) =>
          pendingApprovalEmails.includes(inviteTeamMember) && 'That person is awaiting org approval'
      )
}

export const orgName = (value) =>
  value
    .trim()
    .required('Your new org needs a name!')
    .min(2, 'C’mon, you call that an organization?')
    .max(100, 'Maybe just the legal name?')
    .test((val) => (linkify.match(val) ? 'Try using a name, not a link!' : undefined))

export const preferredName = (value) =>
  value
    .trim()
    .required('That’s not much of a name, is it?')
    .min(2, 'C’mon, you call that a name?')
    .max(100, 'I want your name, not your life story')

export const task = (value) =>
  value
    .trim()
    .min(2, 'That doesn’t seem like much of a task')
    .max(TASK_MAX_CHARS, 'Try shortening down the task name')

export const teamName = (value) =>
  value
    .trim()
    .required('“The nameless wonder” is better than nothing')
    .min(2, 'The “A Team” had a longer name than that')
    .max(50, 'That isn’t very memorable. Maybe shorten it up?')
    .test((val) => (linkify.match(val) ? 'Try using a name, not a link!' : undefined))

export const makeTeamNameSchema = (teamNames) => (value) =>
  value
    .trim()
    .required('“The nameless wonder” is better than nothing')
    .min(2, 'The “A Team” had a longer name than that')
    .max(50, 'That isn’t very memorable. Maybe shorten it up?')
    .test((val) => teamNames.includes(val) && 'That name is already taken')
    .test((val) => (linkify.match(val) ? 'Try using a name, not a link!' : undefined))

export const optionalUrl = (value) =>
  value
    .trim()
    .test((value) => {
      if (value) {
        try {
          new URL(value)
        } catch (e) {
          return e.message
        }
      }
    }, 'that url doesn’t look quite right')
    .max(2000, 'please use a shorter url')
