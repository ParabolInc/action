import {PALETTE} from '~/styles/paletteV3'
import demoUserAvatar from '../../styles/theme/images/avatar-user.svg'
import {MeetingSettingsThreshold, RetroDemo} from '../../types/constEnums'
import RetrospectiveMeeting from '../../../server/database/types/MeetingRetrospective'
import RetrospectiveMeetingSettings from '../../../server/database/types/MeetingSettingsRetrospective'
import {TierEnum} from '~/__generated__/StandardHub_viewer.graphql'
import ITask from '../../../server/database/types/Task'
import {SlackNotificationEventEnum} from '~/__generated__/SlackNotificationList_viewer.graphql'
import {TaskServiceEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import {CHECKIN, DISCUSS, GROUP, REFLECT, RETROSPECTIVE, VOTE} from '../../utils/constants'
import getDemoAvatar from '../../utils/getDemoAvatar'
import toTeamMemberId from '../../utils/relay/toTeamMemberId'
import {DemoReflection, DemoReflectionGroup, DemoTask} from './ClientGraphQLServer'

export const demoViewerId = 'demoUser'
export const demoTeamId = 'demoTeam'
export const demoOrgId = 'demoOrg'
export const demoTeamName = 'Demo Team'

interface BaseUser {
  preferredName: string
  email: string
  picture: string
}

type IRetrospectiveMeeting = Omit<
  RetrospectiveMeeting,
  'summarySentAt' | 'createdAt' | 'endedAt'
> & {
  __typename: string
  createdAt: string | Date
  endedAt: string | Date | null
  meetingMembers: any
  team: any
  settings: any
  summarySentAt: string | Date | null
  votesRemaining: number
}

type IRetrospectiveMeetingSettings = RetrospectiveMeetingSettings & {
  team: any
}

const initMeetingSettings = () => {
  return {
    __typename: 'RetrospectiveMeetingSettings',
    phaseTypes: [CHECKIN, REFLECT, GROUP, VOTE, DISCUSS],
    id: 'settingsId',
    maxVotesPerGroup: 3,
    meetingType: RETROSPECTIVE,
    selectedTemplateId: 'templateId',
    teamId: demoTeamId,
    settingsId: 'settingsId',
    reflectTemplates: [],
    totalVotes: 5
  } as Partial<IRetrospectiveMeetingSettings>
}

export const JiraDemoKey = 'Demo'
export const JiraDemoCloudName = 'jira-demo'
const JiraSecretKey = 'jira-secret'

export const JiraProjectKeyLookup = {
  [JiraDemoKey]: {
    projectKey: JiraDemoKey,
    projectName: 'Demo Jira Project',
    cloudId: '123',
    cloudName: JiraDemoCloudName,
    avatar: 'foo',
    service: 'jira' as TaskServiceEnum
  },
  [JiraSecretKey]: {
    projectKey: JiraSecretKey,
    projectName: 'Secret Jira Project',
    cloudId: '123',
    cloudName: JiraDemoCloudName,
    avatar: 'foo',
    service: 'jira' as TaskServiceEnum
  }
}

export const GitHubDemoKey = 'ParabolInc/ParabolDemo'
export const GitHubProjectKeyLookup = {
  [GitHubDemoKey]: {
    nameWithOwner: GitHubDemoKey,
    service: 'github' as TaskServiceEnum
  }
}

const makeSuggestedIntegrationJira = (key) => ({
  __typename: 'SuggestedIntegrationJira',
  id: key,
  remoteProject: {},
  ...JiraProjectKeyLookup[key]
})

const makeSuggestedIntegrationGitHub = (nameWithOwner) => ({
  __typename: 'SuggestedIntegrationGitHub',
  id: nameWithOwner,
  ...GitHubProjectKeyLookup[nameWithOwner]
})

const initDemoUser = ({preferredName, email, picture}: BaseUser, idx: number) => {
  const now = new Date().toJSON()
  const id = idx === 0 ? demoViewerId : `bot${idx}`
  return {
    id,
    viewerId: id,
    createdAt: now,
    email,
    featureFlags: {
      jira: false,
      video: false
    },
    facilitatorUserId: id,
    facilitatorName: preferredName,
    inactive: false,
    isConnected: true,
    lastSeenAtURLs: [`/meet/${RetroDemo.MEETING_ID}`],
    lastSeenAt: now,
    rasterPicture: picture,
    picture: picture,
    preferredName,
    tms: [demoTeamId]
  }
}

const initSlackNotification = (userId) => ({
  __typename: 'SlackNotification',
  id: 'demoSlackNotification',
  event: 'MEETING_STAGE_TIME_LIMIT_START' as SlackNotificationEventEnum,
  eventType: 'team',
  channelId: 'demoChannelId',
  userId,
  teamId: demoTeamId
})

const initSlackAuth = (userId) => ({
  __typename: 'SlackAuth',
  isActive: true,
  botUserId: 'demoSlackBotId',
  botAccessToken: 'demoToken',
  defaultTeamChannelId: 'demoChannelId',
  teamId: demoTeamId,
  userId,
  slackTeamId: 'demoSlackTeamId',
  slackTeamName: 'demoTeam',
  slackUserId: 'demoUserId',
  slackUserName: 'Demo Slack User',
  id: 'demoSlackUser',
  notifications: [initSlackNotification(userId)]
})

const initDemoTeamMember = ({id: userId, preferredName, picture}, idx) => {
  const teamMemberId = toTeamMemberId(demoTeamId, userId)
  return {
    __typename: 'TeamMember',
    email: 'you@parabol.co',
    id: teamMemberId,
    teamMemberId,
    isLead: idx === 0,
    isSelf: idx === 0,
    picture: picture,
    preferredName,
    integrations: {
      atlassian: {isActive: true, accessToken: '123'},
      github: {isActive: true, accessToken: '123'},
      slack: initSlackAuth(userId)
    },
    suggestedIntegrations: {
      hasMore: true,
      items: [
        makeSuggestedIntegrationJira(JiraDemoKey),
        makeSuggestedIntegrationGitHub(GitHubDemoKey)
      ]
    },
    allAvailableIntegrations: [
      makeSuggestedIntegrationJira(JiraDemoKey),
      makeSuggestedIntegrationJira(JiraSecretKey)
    ],
    teamId: demoTeamId,
    userId
  }
}

const initDemoMeetingMember = (user) => {
  return {
    __typename: 'RetrospectiveMeetingMember',
    id: toTeamMemberId(RetroDemo.MEETING_ID, user.id),
    meetingId: RetroDemo.MEETING_ID,
    meetingType: RETROSPECTIVE,
    teamId: demoTeamId,
    teamMember: initDemoTeamMember(user, 0),
    tasks: [] as ITask[],
    user,
    userId: user.id,
    votesRemaining: 5
  }
}

const initDemoOrg = () => {
  return {
    id: demoOrgId,
    name: 'Demo Organization',
    tier: 'pro',
    orgUserCount: {
      activeUserCount: 5,
      inactiveUserCount: 0
    },
    showConversionModal: false
  } as const
}

const initDemoTeam = (organization, teamMembers, newMeeting) => {
  return {
    __typename: 'Team',
    id: demoTeamId,
    isArchived: false,
    isPaid: true,
    activeMeetings: [newMeeting],
    agendaItems: [],
    massInviteToken: '42',
    name: demoTeamName,
    teamName: demoTeamName,
    orgId: demoOrgId,
    tier: 'pro' as TierEnum,
    teamId: demoTeamId,
    organization,
    meetingSettings: initMeetingSettings(),
    teamMembers
  }
}

const initCheckInStage = (teamMember) => ({
  __typename: 'CheckInStage',
  endAt: new Date().toJSON(),
  id: 'checkinStage',
  isComplete: true,
  meetingId: RetroDemo.MEETING_ID,
  phaseType: CHECKIN,
  teamMemberId: teamMember.id,
  meetingMember: teamMember.meetingMember,
  teamMember
})

const initPhases = (teamMembers) => {
  const now = new Date().toJSON()
  return [
    {
      __typename: 'CheckInPhase',
      checkInGreeting: {
        content: 'Bonjour',
        language: 'french'
      },
      checkInQuestion:
        '{"blocks":[{"key":"1bm6m","text":"What’s got your attention today, and why?","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
      id: 'checkinPhase',
      phaseType: CHECKIN,
      meetingId: RetroDemo.MEETING_ID,
      stages: teamMembers.map(initCheckInStage)
    },
    {
      __typename: 'ReflectPhase',
      id: 'reflectPhase',
      phaseType: REFLECT,
      focusedPromptId: null,
      meetingId: RetroDemo.MEETING_ID,
      teamId: demoTeamId,
      reflectPrompts: [
        {
          id: 'startId',
          promptId: 'startId',
          question: 'Start',
          description: 'What new behaviors should we adopt?',
          groupColor: PALETTE.JADE_400
        },
        {
          id: 'stopId',
          promptId: 'stopId',
          question: 'Stop',
          description: 'What existing behaviors should we cease doing?',
          groupColor: PALETTE.TOMATO_500
        },
        {
          id: 'continueId',
          promptId: 'continueId',
          question: 'Continue',
          description: 'What current behaviors should we keep doing?',
          groupColor: PALETTE.SKY_500
        }
      ],
      stages: [
        {
          __typename: 'GenericMeetingStage',
          id: RetroDemo.REFLECT_STAGE_ID,
          isComplete: false,
          isNavigable: true,
          isNavigableByFacilitator: true,
          meetingId: RetroDemo.MEETING_ID,
          phaseType: REFLECT,
          readyCount: 0,
          startAt: now
        }
      ]
    },
    {
      __typename: 'GenericMeetingPhase',
      id: 'groupPhase',
      phaseType: GROUP,
      meetingId: RetroDemo.MEETING_ID,
      stages: [
        {
          __typename: 'GenericMeetingStage',
          id: RetroDemo.GROUP_STAGE_ID,
          isComplete: false,
          meetingId: RetroDemo.MEETING_ID,
          phaseType: GROUP,
          readyCount: 0
        }
      ]
    },
    {
      __typename: 'GenericMeetingPhase',
      id: 'votePhase',
      phaseType: VOTE,
      meetingId: RetroDemo.MEETING_ID,
      stages: [
        {
          __typename: 'GenericMeetingStage',
          id: RetroDemo.VOTE_STAGE_ID,
          isComplete: false,
          meetingId: RetroDemo.MEETING_ID,
          phaseType: VOTE,
          readyCount: 0
        }
      ]
    },
    {
      __typename: 'DiscussPhase',
      id: 'discussPhase',
      phaseType: DISCUSS,
      meetingId: RetroDemo.MEETING_ID,
      stages: [
        {
          __typename: 'RetroDiscussStage',
          id: 'discussStage0',
          meetingId: RetroDemo.MEETING_ID,
          isComplete: false,
          isNavigable: false,
          isNavigableByFacilitator: false,
          phaseType: DISCUSS,
          reflectionGroup: null,
          readyCount: 0,
          sortOrder: 0
        }
      ]
    }
  ]
}

const initNewMeeting = (organization, teamMembers, meetingMembers) => {
  const now = new Date().toJSON()
  const [viewerMeetingMember] = meetingMembers
  const [viewerTeamMember] = teamMembers
  return {
    __typename: 'RetrospectiveMeeting',
    createdAt: now,
    createdBy: demoViewerId,
    endedAt: null,
    facilitatorStageId: RetroDemo.REFLECT_STAGE_ID,
    facilitatorUserId: demoViewerId,
    facilitator: viewerTeamMember,
    id: RetroDemo.MEETING_ID,
    // alias is important for relay to normalize records correctly. if not supplied, value will be null
    meetingId: RetroDemo.MEETING_ID,
    meetingNumber: 1,
    meetingType: RETROSPECTIVE,
    meetingMember: viewerMeetingMember,
    name: 'Retro Meeting',
    organization,
    showConversionModal: false,
    meetingMembers,
    nextAutoGroupThreshold: null,
    viewerMeetingMember,
    reflectionGroups: [] as any[],
    votesRemaining: teamMembers.length * 5,
    phases: initPhases(teamMembers) as any[],
    summarySentAt: null,
    totalVotes: MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_DEFAULT,
    maxVotesPerGroup: MeetingSettingsThreshold.RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT,
    teamId: demoTeamId
  } as Partial<IRetrospectiveMeeting>
}

const initDB = (botScript) => {
  const baseUsers = [
    {
      preferredName: 'You',
      email: 'demo-user@example.co',
      picture: demoUserAvatar
      // picture: getDemoAvatar(3).picture
    },
    getDemoAvatar(1),
    getDemoAvatar(2)
  ]
  const users = baseUsers.map(initDemoUser)
  const meetingMembers = users.map(initDemoMeetingMember)
  const teamMembers = users.map(initDemoTeamMember).map((teamMember, idx) => ({
    ...teamMember,
    meetingMember: meetingMembers[idx],
    user: users[idx]
  }))
  users.forEach((user, idx) => {
    ;(user as any).teamMember = teamMembers[idx]
  })
  const org = initDemoOrg()
  const newMeeting = initNewMeeting(org, teamMembers, meetingMembers)
  const team = initDemoTeam(org, teamMembers, newMeeting)
  teamMembers.forEach((teamMember) => {
    ;(teamMember as any).team = team
  })
  team.meetingSettings.team = team as any
  newMeeting.commentCount = 0
  newMeeting.reflectionCount = 0
  newMeeting.taskCount = 0
  newMeeting.team = team as any
  newMeeting.teamId = team.id
  newMeeting.topicCount = 0
  newMeeting.settings = team.meetingSettings as any
  return {
    meetingMembers,
    newMeeting,
    organization: org,
    comments: [] as any[],
    reflections: [] as DemoReflection[],
    reflectionGroups: (newMeeting as any).reflectionGroups as DemoReflectionGroup[],
    tasks: [] as DemoTask[],
    team,
    teamMembers,
    users,
    _updatedAt: new Date(),
    _tempID: 1,
    _botScript: botScript
  }
}

export default initDB
