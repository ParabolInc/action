import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLString} from 'graphql';
import {forwardConnectionArgs} from 'graphql-relay';
import connectionFromTasks from 'server/graphql/queries/helpers/connectionFromTasks';
import {resolveTeam} from 'server/graphql/resolvers';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import PossibleTeamMember from 'server/graphql/types/PossibleTeamMember';
import {TaskConnection} from 'server/graphql/types/Task';
import Team from 'server/graphql/types/Team';
import User from 'server/graphql/types/User';
import {getUserId} from 'server/utils/authorization';
import Assignee from 'server/graphql/types/Assignee';

const TeamMember = new GraphQLObjectType({
  name: 'TeamMember',
  description: 'A member of a team',
  interfaces: () => [PossibleTeamMember, Assignee],
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'An ID for the teamMember. userId::teamId'
    },
    isNotRemoved: {
      type: GraphQLBoolean,
      description: 'true if the user is a part of the team, false if they no longer are'
    },
    isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
    isFacilitator: {type: GraphQLBoolean, description: 'Is user a team facilitator?'},
    hideAgenda: {
      type: GraphQLBoolean,
      description: 'hide the agenda list on the dashboard'
    },
    /* denormalized from User */
    email: {
      type: GraphQLEmailType,
      description: 'The user email'
    },
    picture: {
      type: GraphQLURLType,
      description: 'url of user’s profile picture'
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name, as confirmed by the user'
    },
    /* Ephemeral meeting state */
    checkInOrder: {
      type: GraphQLInt,
      description: 'The place in line for checkIn, regenerated every meeting'
    },
    isConnected: {
      type: GraphQLBoolean,
      description: 'true if the user is connected',
      resolve: async (source, args, {dataLoader}) => {
        if (source.hasOwnProperty('isConnected')) {
          return source.isConnected;
        }
        const {userId} = source;
        const {connectedSockets} = await dataLoader.get('users').load(userId);
        return Array.isArray(connectedSockets) && connectedSockets.length > 0;
      }
    },
    isCheckedIn: {
      type: GraphQLBoolean,
      description: 'true if present, false if absent, null before check-in'
    },
    isSelf: {
      type: GraphQLBoolean,
      description: 'true if this team member belongs to the user that queried it',
      resolve: (source, args, {authToken}) => {
        const userId = getUserId(authToken);
        return source.userId === userId;
      }
    },
    /* Foreign keys */
    teamId: {
      type: GraphQLID,
      description: 'foreign key to Team table'
    },
    userId: {
      type: GraphQLID,
      description: 'foreign key to User table'
    },
    /* GraphQL sugar */
    team: {
      type: Team,
      description: 'The team this team member belongs to',
      resolve: resolveTeam
    },
    user: {
      type: User,
      description: 'The user for the team member',
      resolve({userId}, args, {dataLoader}) {
        return dataLoader.get('users').load(userId);
      }
    },
    tasks: {
      type: TaskConnection,
      description: 'Tasks owned by the team member',
      args: {
        ...forwardConnectionArgs,
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        }
      },
      resolve: async ({teamId, userId}, args, {dataLoader}) => {
        const allTasks = await dataLoader.get('tasksByTeamId').load(teamId);
        const tasksForUserId = allTasks.filter((task) => task.userId === userId);
        const publicTasksForUserId = tasksForUserId.filter((task) => !task.tags.includes('private'));
        return connectionFromTasks(publicTasksForUserId);
      }
    }
  })
});

export default TeamMember;
