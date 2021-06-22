import TimelineEventCheckinComplete from 'parabol-server/database/types/TimelineEventCheckinComplete'
import TimelineEventRetroComplete from 'parabol-server/database/types/TimelineEventRetroComplete'
import getRethink from '../database/rethinkDriver'
import LoaderMakerForeign from './LoaderMakerForeign'
import getTeamsByOrgId from '../postgres/queries/getTeamsByOrgId'

export const activeMeetingsByTeamId = new LoaderMakerForeign(
  'newMeetings',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('NewMeeting')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({endedAt: null}, {default: true})
      .orderBy(r.desc('createdAt'))
      .run()
  }
)

export const agendaItemsByTeamId = new LoaderMakerForeign(
  'agendaItems',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('AgendaItem')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({isActive: true})
      .orderBy('sortOrder')
      .run()
  }
)

export const agendaItemsByMeetingId = new LoaderMakerForeign(
  'agendaItems',
  'meetingId',
  async (meetingIds) => {
    const r = await getRethink()
    return r
      .table('AgendaItem')
      .getAll(r.args(meetingIds), {index: 'meetingId'})
      .orderBy('sortOrder')
      .run()
  }
)
export const atlassianAuthByUserId = new LoaderMakerForeign(
  'atlassianAuths',
  'userId',
  async (userIds) => {
    const r = await getRethink()
    return r
      .table('AtlassianAuth')
      .getAll(r.args(userIds), {index: 'userId'})
      .run()
  }
)
export const atlassianAuthByTeamId = new LoaderMakerForeign(
  'atlassianAuths',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('AtlassianAuth')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .run()
  }
)
export const commentsByThreadId = new LoaderMakerForeign(
  'comments',
  'threadId',
  async (threadIds) => {
    const r = await getRethink()
    return (
      r
        .table('Comment')
        .getAll(r.args(threadIds), {index: 'threadId'})
        // include deleted comments so we can replace them with tombstones
        // .filter({isActive: true})
        .run()
    )
  }
)

export const completedMeetingsByTeamId = new LoaderMakerForeign(
  'newMeetings',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('NewMeeting')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((row) =>
        row('endedAt')
          .default(null)
          .ne(null)
      )
      .orderBy(r.desc('endedAt'))
      .run()
  }
)

export const reflectPromptsByTemplateId = new LoaderMakerForeign(
  'reflectPrompts',
  'templateId',
  async (templateIds) => {
    const r = await getRethink()
    return r
      .table('ReflectPrompt')
      .getAll(r.args(templateIds), {index: 'templateId'})
      .orderBy('sortOrder')
      .run()
  }
)

export const massInvitationsByTeamMemberId = new LoaderMakerForeign(
  'massInvitations',
  'teamMemberId',
  async (teamMemberIds) => {
    const r = await getRethink()
    return r
      .table('MassInvitation')
      .getAll(r.args(teamMemberIds), {index: 'teamMemberId'})
      .orderBy(r.desc('expiration'))
      .run()
  }
)
export const meetingMembersByMeetingId = new LoaderMakerForeign(
  'meetingMembers',
  'meetingId',
  async (meetingIds) => {
    const r = await getRethink()
    return r
      .table('MeetingMember')
      .getAll(r.args(meetingIds), {index: 'meetingId'})
      .run()
  }
)

export const meetingMembersByUserId = new LoaderMakerForeign(
  'meetingMembers',
  'userId',
  async (userIds) => {
    const r = await getRethink()
    return r
      .table('MeetingMember')
      .getAll(r.args(userIds), {index: 'userId'})
      .run()
  }
)

export const organizationsByActiveDomain = new LoaderMakerForeign(
  'organizations',
  'activeDomain',
  async (activeDomains) => {
    const r = await getRethink()
    return r
      .table('Organization')
      .getAll(r.args(activeDomains), {index: 'activeDomain'})
      .run()
  }
)
export const organizationUsersByOrgId = new LoaderMakerForeign(
  'organizationUsers',
  'orgId',
  async (orgIds) => {
    const r = await getRethink()
    return r
      .table('OrganizationUser')
      .getAll(r.args(orgIds), {index: 'orgId'})
      .filter({removedAt: null})
      .run()
  }
)

export const organizationUsersByUserId = new LoaderMakerForeign(
  'organizationUsers',
  'userId',
  async (userIds) => {
    const r = await getRethink()
    return r
      .table('OrganizationUser')
      .getAll(r.args(userIds), {index: 'userId'})
      .filter({removedAt: null})
      .run()
  }
)

export const retroReflectionGroupsByMeetingId = new LoaderMakerForeign(
  'retroReflectionGroups',
  'meetingId',
  async (meetingIds) => {
    const r = await getRethink()
    return r
      .table('RetroReflectionGroup')
      .getAll(r.args(meetingIds), {index: 'meetingId'})
      .filter({isActive: true})
      .run()
  }
)

export const meetingTemplatesByOrgId = new LoaderMakerForeign(
  'meetingTemplates',
  'orgId',
  async (orgId) => {
    const r = await getRethink()
    return r
      .table('MeetingTemplate')
      .getAll(r.args(orgId), {index: 'orgId'})
      .filter({isActive: true})
      .run()
  }
)
export const meetingTemplatesByTeamId = new LoaderMakerForeign(
  'meetingTemplates',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('MeetingTemplate')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({isActive: true})
      .run()
  }
)

export const scalesByTeamId = new LoaderMakerForeign(
  'templateScales',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('TemplateScale')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((row) =>
        row('removedAt')
          .default(null)
          .eq(null)
      )
      .orderBy('sortOrder')
      .run()
  }
)

export const retroReflectionsByMeetingId = new LoaderMakerForeign(
  'retroReflections',
  'meetingId',
  async (meetingIds) => {
    const r = await getRethink()
    return r
      .table('RetroReflection')
      .getAll(r.args(meetingIds), {index: 'meetingId'})
      .filter({isActive: true})
      .run()
  }
)

export const templateDimensionsByTemplateId = new LoaderMakerForeign(
  'templateDimensions',
  'templateId',
  async (templateIds) => {
    const r = await getRethink()
    return (
      r
        .table('TemplateDimension')
        .getAll(r.args(templateIds), {index: 'templateId'})
        // NOTE: isActive must be false so we can see meetings in the past that use a now-inactive template
        // .filter({isActive: true})
        .orderBy('sortOrder')
        .run()
    )
  }
)
export const timelineEventsByMeetingId = new LoaderMakerForeign(
  'timelineEvents',
  'meetingId',
  async (meetingIds) => {
    const r = await getRethink()
    return r
      .table('TimelineEvent')
      .getAll(r.args(meetingIds), {index: 'meetingId'})
      .filter({isActive: true})
      .run() as Promise<TimelineEventCheckinComplete[] | TimelineEventRetroComplete[]>
  }
)

export const slackAuthByUserId = new LoaderMakerForeign('slackAuths', 'userId', async (userIds) => {
  const r = await getRethink()
  return r
    .table('SlackAuth')
    .getAll(r.args(userIds), {index: 'userId'})
    .run()
})

export const slackNotificationsByTeamId = new LoaderMakerForeign(
  'slackNotifications',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('SlackNotification')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .run()
  }
)

export const suggestedActionsByUserId = new LoaderMakerForeign(
  'suggestedActions',
  'userId',
  async (userIds) => {
    const r = await getRethink()
    return r
      .table('SuggestedAction')
      .getAll(r.args(userIds), {index: 'userId'})
      .filter({removedAt: null})
      .run()
  }
)

export const teamsByOrgId = new LoaderMakerForeign('teams', 'orgId', async (orgIds) => {
  return await getTeamsByOrgId(orgIds, {isArchived: false})
})

export const tasksByThreadId = new LoaderMakerForeign('tasks', 'threadId', async (threadIds) => {
  const r = await getRethink()
  return (
    r
      .table('Task')
      .getAll(r.args(threadIds), {index: 'threadId'})
      // include archived cards in the conversation, since it's persistent
      .run()
  )
})

export const tasksByTeamId = new LoaderMakerForeign('tasks', 'teamId', async (teamIds) => {
  const r = await getRethink()
  // waraning! contains private tasks
  return r
    .table('Task')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter((task) =>
      task('tags')
        .contains('archived')
        .not()
    )
    .run()
})

export const teamInvitationsByTeamId = new LoaderMakerForeign(
  'teamInvitations',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    const now = new Date()
    return r
      .table('TeamInvitation')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({acceptedAt: null})
      .filter((row) => row('expiresAt').ge(now))
      .run()
  }
)

export const teamMembersByTeamId = new LoaderMakerForeign(
  'teamMembers',
  'teamId',
  async (teamIds) => {
    // tasksByUserId is expensive since we have to look up each team to check the team archive status
    const r = await getRethink()
    return r
      .table('TeamMember')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({isNotRemoved: true})
      .run()
  }
)

export const teamMembersByUserId = new LoaderMakerForeign(
  'teamMembers',
  'userId',
  async (userIds) => {
    // tasksByUserId is expensive since we have to look up each team to check the team archive status
    const r = await getRethink()
    return r
      .table('TeamMember')
      .getAll(r.args(userIds), {index: 'userId'})
      .filter({isNotRemoved: true})
      .run()
  }
)
