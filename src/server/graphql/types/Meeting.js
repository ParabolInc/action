import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import MeetingInvitee from 'server/graphql/types/MeetingInvitee';
import MeetingTask from 'server/graphql/types/MeetingTask';
import TeamMember from 'server/graphql/types/TeamMember';

const Meeting = new GraphQLObjectType({
  name: 'Meeting',
  description: 'A team meeting history for all previous meetings',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique meeting id. shortid.'},
    agendaItemsCompleted: {
      type: GraphQLInt,
      description: 'The number of agenda items completed during the meeting'
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting was created'
    },
    endedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting officially ended'
    },
    facilitator: {
      type: GraphQLID,
      description: 'The teamMemberId of the person who ended the meeting'
    },
    invitees: {
      type: new GraphQLList(MeetingInvitee)
    },
    meetingNumber: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The auto-incrementing meeting number for the team'
    },
    tasks: {
      type: new GraphQLList(MeetingTask),
      description: 'A list of immutable tasks, as they were created in the meeting'
    },
    sinceTime: {
      type: GraphQLISO8601Type,
      description: 'The start time used to create the diff (all taskDiffs occurred between this time and the endTime'
    },
    successExpression: {
      type: GraphQLString,
      description: 'The happy introductory clause to the summary'
    },
    successStatement: {
      type: GraphQLString,
      description: 'The happy body statement for the summary'
    },
    summarySentAt: {
      type: GraphQLISO8601Type,
      description: 'The time the meeting summary was emailed to the team'
    },
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team associated with this meeting'},
    teamName: {type: GraphQLString, description: 'The name as it was when the meeting occurred'},
    /* GraphQL Sugar */
    teamMembers: {
      type: new GraphQLList(TeamMember),
      description: 'All the team members associated who can join this team',
      resolve({teamId}) {
        const r = getRethink();
        return r.table('TeamMember')
          .getAll(teamId, {index: 'teamId'})
          .run();
      }
    }
  })
});

export default Meeting;
