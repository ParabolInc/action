import {DataLoaderType} from 'parabol-client/types/constEnums'

class LoaderMakerPrimary {
  type = DataLoaderType.PRIMARY
  constructor(public table: string) {}
}

export const agendaItems = new LoaderMakerPrimary('AgendaItem')
export const atlassianAuths = new LoaderMakerPrimary('AtlassianAuth')
export const customPhaseItems = new LoaderMakerPrimary('CustomPhaseItem')
export const meetingSettings = new LoaderMakerPrimary('MeetingSettings')
export const meetingMembers = new LoaderMakerPrimary('MeetingMember')
export const newMeetings = new LoaderMakerPrimary('NewMeeting')
export const newFeatures = new LoaderMakerPrimary('NewFeature')
export const notifications = new LoaderMakerPrimary('Notification')
export const organizations = new LoaderMakerPrimary('Organization')
export const organizationUsers = new LoaderMakerPrimary('OrganizationUser')
export const reflectTemplates = new LoaderMakerPrimary('ReflectTemplate')
export const retroReflectionGroups = new LoaderMakerPrimary('RetroReflectionGroup')
export const retroReflections = new LoaderMakerPrimary('RetroReflection')
export const slackAuths = new LoaderMakerPrimary('SlackAuth')
export const slackNotifications = new LoaderMakerPrimary('SlackNotification')
export const suggestedActions = new LoaderMakerPrimary('SuggestedAction')
export const tasks = new LoaderMakerPrimary('Task')
export const teamMembers = new LoaderMakerPrimary('TeamMember')
export const teamInvitations = new LoaderMakerPrimary('TeamInvitation')
export const teams = new LoaderMakerPrimary('Team')
export const users = new LoaderMakerPrimary('User')
