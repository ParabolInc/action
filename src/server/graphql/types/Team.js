import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import {forwardConnectionArgs} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import connectionFromTasks from 'server/graphql/queries/helpers/connectionFromTasks';
import ActionMeetingPhaseEnum from 'server/graphql/types/ActionMeetingPhaseEnum';
import AgendaItem from 'server/graphql/types/AgendaItem';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import Invitation from 'server/graphql/types/Invitation';
import MeetingGreeting from 'server/graphql/types/MeetingGreeting';
import Organization from 'server/graphql/types/Organization';
import OrgApproval from 'server/graphql/types/OrgApproval';
import {TaskConnection} from 'server/graphql/types/Task';
import TeamMember from 'server/graphql/types/TeamMember';
import TierEnum from 'server/graphql/types/TierEnum';
import {requireTeamMember} from 'server/utils/authorization';
import {PENDING} from 'server/utils/serverConstants';
import {resolveOrganization} from 'server/graphql/resolvers';
import SoftTeamMember from 'server/graphql/types/SoftTeamMember';
import CustomPhaseItem from 'server/graphql/types/CustomPhaseItem';

const Team = new GraphQLObjectType({
  name: 'Team',
  description: 'A team',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'A shortid for the team'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the team was created'
    },
    // isActive: {
    //   type: GraphQLBoolean,
    //   description: 'true if the team is active, false if it is in the archive'
    // },
    isPaid: {
      type: GraphQLBoolean,
      description: 'true if the underlying org has a validUntil date greater than now. if false, subs do not work'
    },
    meetingNumber: {
      type: GraphQLInt,
      description: 'The current or most recent meeting number (also the number of meetings the team has had'
    },
    name: {type: GraphQLString, description: 'The name of the team'},
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
    /* Ephemeral meeting state */
    checkInGreeting: {
      type: MeetingGreeting,
      description: 'The checkIn greeting (fun language)'
    },
    checkInQuestion: {
      type: GraphQLString,
      description: 'The checkIn question of the week'
    },
    customPhaseItems: {
      type: new GraphQLList(CustomPhaseItem),
      resolve: ({id: teamId}, args, {dataLoader}) => {
        return dataLoader.get('customPhaseItemsByTeamId').load(teamId);
      }
    },
    meetingId: {
      type: GraphQLID,
      description: 'The unique Id of the active meeting'
    },
    activeFacilitator: {
      type: GraphQLID,
      description: 'The current facilitator teamMemberId for this meeting'
    },
    facilitatorPhase: {
      type: ActionMeetingPhaseEnum,
      description: 'The phase of the facilitator'
    },
    facilitatorPhaseItem: {
      type: GraphQLInt,
      description: 'The current item number for the current phase for the facilitator, 1-indexed'
    },
    invitations: {
      type: new GraphQLList(Invitation),
      description: 'The outstanding invitations to join the team',
      resolve: ({id: teamId}) => {
        const r = getRethink();
        const now = new Date();
        return r.table('Invitation')
          .getAll(teamId, {index: 'teamId'})
          .filter(r.row('tokenExpiration').ge(now))
          .orderBy('createdAt')
          .run();
      }
    },
    meetingPhase: {
      type: ActionMeetingPhaseEnum,
      description: 'The phase of the meeting, usually matches the facilitator phase, be could be further along'
    },
    meetingPhaseItem: {
      type: GraphQLInt,
      description: 'The current item number for the current phase for the meeting, 1-indexed'
    },
    tier: {
      type: TierEnum,
      description: 'The level of access to features on the parabol site'
    },
    orgApprovals: {
      type: new GraphQLList(OrgApproval),
      description: 'The outstanding invitations to join the team',
      resolve: ({id: teamId}) => {
        const r = getRethink();
        return r.table('OrgApproval')
          .getAll(teamId, {index: 'teamId'})
          .filter({status: PENDING, isActive: true})
          .orderBy('email')
          .run();
      }
    },
    organization: {
      type: Organization,
      resolve: resolveOrganization
    },
    agendaItems: {
      type: new GraphQLList(AgendaItem),
      description: 'The agenda items for the upcoming or current meeting',
      async resolve({id: teamId}, args, {dataLoader}) {
        const agendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId);
        agendaItems.sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1);
        return agendaItems;
      }
    },
    tasks: {
      type: TaskConnection,
      args: {
        ...forwardConnectionArgs,
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        }
      },
      description: 'All of the tasks for this team',
      async resolve({id: teamId}, args, {authToken, dataLoader}) {
        requireTeamMember(authToken, teamId);
        const tasks = await dataLoader.get('tasksByTeamId').load(teamId);
        return connectionFromTasks(tasks);
      }
    },
    softTeamMembers: {
      type: new GraphQLList(SoftTeamMember),
      description: 'All the soft team members actively associated with the team',
      async resolve({id: teamId}, args, {dataLoader}) {
        const softTeamMembers = await dataLoader.get('softTeamMembersByTeamId').load(teamId);
        softTeamMembers.sort((a, b) => a.preferredName > b.preferredName ? 1 : -1);
        return softTeamMembers;
      }
    },
    teamMembers: {
      type: new GraphQLList(TeamMember),
      args: {
        sortBy: {
          type: GraphQLString,
          description: 'the field to sort the teamMembers by'
        }
      },
      description: 'All the team members actively associated with the team',
      async resolve({id: teamId}, {sortBy = 'preferredName'}, {dataLoader}) {
        const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId);
        teamMembers.sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1);
        return teamMembers;
      }
    },
    isArchived: {
      type: GraphQLBoolean,
      description: 'true if the team has been archived'
    }
  })
});

export default Team;
