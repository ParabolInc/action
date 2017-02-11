import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString,
  GraphQLList
} from 'graphql';
import {ensureUniqueId, getUserId, requireWebsocket} from 'server/utils/authorization';
import {handleSchemaErrors} from 'server/utils/utils';
import {TeamInput} from 'server/graphql/models/Team/teamSchema';
import {Invitee} from 'server/graphql/models/Invitation/invitationSchema';
import addOrgValidation from 'server/graphql/models/Organization/addOrg/addOrgValidation';
import createTeamAndLeader from '../../Team/createFirstTeam/createTeamAndLeader';
import asyncInviteTeam from 'server/graphql/models/Invitation/inviteTeamMembers/asyncInviteTeam';
import createNewOrg from 'server/graphql/models/Organization/addOrg/createNewOrg';

export default {
  type: GraphQLBoolean,
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(TeamInput),
      description: 'The new team object with exactly 1 team member'
    },
    invitees: {
      type: new GraphQLList(new GraphQLNonNull(Invitee))
    },
    orgName: {
      type: GraphQLString,
      description: 'The name of the new team'
    },
    stripeToken: {
      type: GraphQLString,
      description: 'The CC info for the new team'
    }
  },
  async resolve(source, args, {authToken, socket}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    const {orgId} = args.newTeam;
    const userId = getUserId(authToken);
    requireWebsocket(socket);

    // VALIDATION
    const {data: {invitees, newTeam, orgName, stripeToken}, errors} = addOrgValidation()(args);
    const {id: teamId} = newTeam;
    handleSchemaErrors(errors);
    // this isn't concurrent-safe, but it reduces the risk of conflicting writes
    const ensureUniqueIds = [
      ensureUniqueId('Team', teamId),
      ensureUniqueId('Organization', orgId)
    ];
    await Promise.all(ensureUniqueIds);

    // RESOLUTION
    const teamOrgInvitations = [
      createTeamAndLeader(userId, newTeam, true),
      createNewOrg(orgId, orgName, userId, stripeToken)
    ];
    if (invitees && invitees.length) {
      teamOrgInvitations.push(asyncInviteTeam(userId, teamId, invitees));
    }
    await Promise.all(teamOrgInvitations);

    // TODO add activeUsers on the Organization table instead of activeUserCount.
    // That way, we can index on it & subscribe to all the users orgs

    const authTokenObj = socket.getAuthToken();
    const newAuthTokenObj = {
      ...authTokenObj,
      tms: authTokenObj.tms.concat(teamId),
      exp: undefined
    };
    socket.setAuthToken(newAuthTokenObj);
    return true;
  }
}
