import {DataLoaderType} from 'parabol-client/types/constEnums'
import getRethink from '../database/rethinkDriver'
import * as primaryLoaderMakers from './primaryLoaderMakers'

class LoaderMakerForeign {
  type = DataLoaderType.FOREIGN
  constructor(
    public pk: keyof typeof primaryLoaderMakers,
    public field: string,
    public fetch: (ids: string[]) => Promise<any[]>
  ) {}
}

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

export const azureDevosAuthByUserId = new LoaderMakerForeign(
  'azureDevopsAuths',
  'userId',
  async (userIds) => {
    const r = await getRethink()
    return r
      .table('AzureDevopsAuth')
      .getAll(r.args(userIds), {index: 'userId'})
      .run()
  }
)

export const customPhaseItemsByTeamId = new LoaderMakerForeign(
  'customPhaseItems',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('CustomPhaseItem')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({isActive: true})
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

export const meetingSettingsByTeamId = new LoaderMakerForeign(
  'meetingSettings',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('MeetingSettings')
      .getAll(r.args(teamIds), {index: 'teamId'})
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

export const reflectTemplatesByTeamId = new LoaderMakerForeign(
  'reflectTemplates',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('ReflectTemplate')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({isActive: true})
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
  const r = await getRethink()
  return r
    .table('Team')
    .getAll(r.args(orgIds), {index: 'orgId'})
    .filter((team) =>
      team('isArchived')
        .default(false)
        .ne(true)
    )
    .run()
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
