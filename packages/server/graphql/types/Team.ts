import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import MassInvitationDB from '../../database/types/MassInvitation'
import ITeam from '../../database/types/Team'
import db from '../../db'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import AgendaItem from './AgendaItem'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import MassInvitation from './MassInvitation'
import MeetingTypeEnum from './MeetingTypeEnum'
import NewMeeting from './NewMeeting'
import Organization from './Organization'
import ReflectPrompt from './ReflectPrompt'
import {TaskConnection} from './Task'
import TeamInvitation from './TeamInvitation'
import TeamMeetingSettings from './TeamMeetingSettings'
import TeamMember from './TeamMember'
import TemplateScale from './TemplateScale'
import TierEnum from './TierEnum'
import TeamIntegrations from './TeamIntegrations'

const Team = new GraphQLObjectType<ITeam, GQLContext>({
  name: 'Team',
  description: 'A team',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A shortid for the team'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the team was created'
    },
    createdBy: {
      type: GraphQLID,
      description: 'The userId that created the team. Non-null at v2.22.0+'
    },
    isOnboardTeam: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the team was created when the account was created, else false',
      resolve: ({isOnboardTeam}) => !!isOnboardTeam
    },
    lastMeetingType: {
      type: GraphQLNonNull(MeetingTypeEnum),
      description: 'The type of the last meeting run'
    },
    massInvitation: {
      type: MassInvitation,
      args: {
        meetingId: {
          type: GraphQLID,
          description: 'the meetingId to optionally direct them to'
        }
      },
      description:
        'The hash and expiration for a token that allows anyone with it to join the team',
      resolve: async ({id: teamId}, {meetingId}, {authToken, dataLoader}) => {
        if (!isTeamMember(authToken, teamId)) return null
        const r = await getRethink()
        const viewerId = getUserId(authToken)
        const teamMemberId = toTeamMemberId(teamId, viewerId)
        const invitationTokens = await dataLoader
          .get('massInvitationsByTeamMemberId')
          .load(teamMemberId)
        const [newestInvitationToken] = invitationTokens
        // if the token is valid, return it
        if (newestInvitationToken?.expiration > new Date()) return newestInvitationToken
        // if the token is not valid, delete it to keep the table clean of expired things
        if (newestInvitationToken) {
          await r
            .table('MassInvitation')
            .getAll(teamMemberId, {index: 'teamMemberId'})
            .delete()
            .run()
        }
        const massInvitation = new MassInvitationDB({meetingId, teamMemberId})
        await r
          .table('MassInvitation')
          .insert(massInvitation, {conflict: 'replace'})
          .run()
        invitationTokens.length = 1
        invitationTokens[0] = massInvitation
        return massInvitation
      }
    },
    integrations: {
      type: GraphQLNonNull(TeamIntegrations),
      description: 'Integration details that are shared by all team members. Nothing user specific',
      resolve: (source) => source
    },
    isPaid: {
      type: GraphQLBoolean,
      description:
        'true if the underlying org has a validUntil date greater than now. if false, subs do not work'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The organization to which the team belongs'
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      description: 'Arbitrary tags that the team uses'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the team was last updated'
    },
    customPhaseItems: {
      type: new GraphQLList(ReflectPrompt),
      deprecationReason: 'Field no longer needs to exist for now',
      resolve: () => {
        // not useful for retros since there is no templateId filter
        return []
      }
    },
    teamInvitations: {
      type: GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TeamInvitation))),
      description: 'The outstanding invitations to join the team',
      resolve: async ({id: teamId}, _args, {authToken, dataLoader}) => {
        if (!isTeamMember(authToken, teamId)) return []
        return dataLoader.get('teamInvitationsByTeamId').load(teamId)
      }
    },
    isLead: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the viewer is the team lead, else false',
      resolve: async ({id: teamId}, _args, {authToken, dataLoader}) => {
        if (!isTeamMember(authToken, teamId)) return false
        const viewerId = getUserId(authToken)
        const teamMemberId = toTeamMemberId(teamId, viewerId)
        const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
        return !!teamMember.isLead
      }
    },
    meetingSettings: {
      type: new GraphQLNonNull(TeamMeetingSettings),
      args: {
        meetingType: {
          type: new GraphQLNonNull(MeetingTypeEnum),
          description: 'the type of meeting for the settings'
        }
      },
      description: 'The team-specific settings for running all available types of meetings',
      resolve: async ({id: teamId}, {meetingType}, {authToken, dataLoader}) => {
        // the implicit business logic says client will never request settings for a foregin team
        if (!isTeamMember(authToken, teamId)) return null
        return await dataLoader.get('meetingSettingsByType').load({teamId, meetingType})
      }
    },
    scale: {
      type: TemplateScale,
      description: 'A query for the scale',
      args: {
        scaleId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The scale ID for the desired scale'
        }
      },
      resolve: async ({id: teamId}, {scaleId}, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const activeScales = await dataLoader.get('scalesByTeamId').load(teamId)
        const scale = activeScales.find(({id}) => id === scaleId)
        if (!scale) {
          standardError(new Error('Scale not found'), {userId: viewerId})
          return null
        }
        return scale
      }
    },
    scales: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TemplateScale))),
      description: 'The list of scales this team can use',
      resolve: async ({id: teamId}, {}, {dataLoader}) => {
        const activeTeamScales = await dataLoader.get('scalesByTeamId').load(teamId)
        const publicScales = await db.read('starterScales', 'aGhostTeam')
        const activeScales = [...activeTeamScales, ...publicScales]
        const uniqueScales = activeScales.filter(
          (scale, index) => index === activeScales.findIndex((obj) => obj.id === scale.id)
        )
        return uniqueScales
      }
    },
    activeMeetings: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NewMeeting))),
      description: 'a list of meetings that are currently in progress',
      resolve: async ({id: teamId}, _args, {authToken, dataLoader}) => {
        if (!isTeamMember(authToken, teamId)) return []
        // this is by team, not by meeting member, which caused an err in dev, not sure about prod
        // we need better perms for people to view/not view a meeting that happened before they joined the team
        return dataLoader.get('activeMeetingsByTeamId').load(teamId)
      }
    },
    meeting: {
      type: NewMeeting,
      description: 'The new meeting in progress, if any',
      args: {
        meetingId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The unique meetingId'
        }
      },
      resolve: async ({id: teamId}, {meetingId}, {authToken, dataLoader}) => {
        if (!isTeamMember(authToken, teamId)) return null
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        if (meeting && meeting.teamId === teamId) return meeting
        return null
      }
    },
    tier: {
      type: GraphQLNonNull(TierEnum),
      description: 'The level of access to features on the parabol site'
    },
    organization: {
      type: new GraphQLNonNull(Organization),
      resolve: async ({id: teamId, orgId}, _args, {authToken, dataLoader}) => {
        const organization = await dataLoader.get('organizations').load(orgId)
        // TODO this is bad, we should probably just put the perms on each field in the org
        if (!isTeamMember(authToken, teamId)) {
          return {
            id: orgId,
            name: organization.name
          }
        }
        return organization
      }
    },
    agendaItems: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AgendaItem))),
      description: 'The agenda items for the upcoming or current meeting',
      async resolve({id: teamId}, _args, {authToken, dataLoader}) {
        if (!isTeamMember(authToken, teamId)) return null
        return dataLoader.get('agendaItemsByTeamId').load(teamId)
      }
    },
    tasks: {
      type: new GraphQLNonNull(TaskConnection),
      args: {
        first: {
          type: GraphQLInt
        },
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        }
      },
      description: 'All of the tasks for this team',
      async resolve({id: teamId}, _args, {authToken, dataLoader}) {
        if (!isTeamMember(authToken, teamId)) {
          const err = new Error('Team not found')
          standardError(err, {tags: {teamId}})
          return connectionFromTasks([], 0, err)
        }
        const viewerId = getUserId(authToken)
        const allTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        const tasks = allTasks.filter((task) => {
          if (!task.userId || (isTaskPrivate(task.tags) && task.userId !== viewerId)) return false
          return true
        })
        return connectionFromTasks(tasks)
      }
    },
    teamMembers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TeamMember))),
      args: {
        sortBy: {
          type: GraphQLString,
          description: 'the field to sort the teamMembers by'
        }
      },
      description: 'All the team members actively associated with the team',
      async resolve({id: teamId}, {sortBy = 'preferredName'}, {authToken, dataLoader}) {
        if (!isTeamMember(authToken, teamId)) return []
        const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
        teamMembers.sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1))
        return teamMembers
      }
    },
    isArchived: {
      type: GraphQLBoolean,
      description: 'true if the team has been archived'
    }
  })
})

export default Team
