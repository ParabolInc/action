import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import rejectOrgApprovalValidation from 'server/graphql/mutations/helpers/rejectOrgApprovalValidation';
import RejectOrgApprovalPayload from 'server/graphql/types/RejectOrgApprovalPayload';
import removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {errorObj, handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {DENY_NEW_USER, NOTIFICATION, ORG_APPROVAL, TASK, TEAM_MEMBER} from 'universal/utils/constants';
import archiveTasksForDB from 'server/safeMutations/archiveTasksForDB';
import getActiveTeamsByOrgId from 'server/safeQueries/getActiveTeamsByOrgId';
import getTasksByAssigneeIds from 'server/safeQueries/getTasksByAssigneeIds';
import promiseAllObj from 'universal/utils/promiseAllObj';
import getActiveTeamMembersByTeamIds from 'server/safeQueries/getActiveTeamMembersByTeamIds';
import getActiveSoftTeamMembersByEmail from 'server/safeQueries/getActiveSoftTeamMembersByEmail';
import removeSoftTeamMember from 'server/safeMutations/removeSoftTeamMember';

export default {
  type: RejectOrgApprovalPayload,
  description: 'Reject an invitee from joining any team under your organization',
  args: {
    notificationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The notification to which the Billing Leader is responding'
    },
    reason: {
      type: GraphQLString
    }
  },
  async resolve(source, args, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {operationId, mutatorId};

    // AUTH
    const {notificationId} = args;
    const viewerId = getUserId(authToken);
    const rejectionNotification = await r.table('Notification').get(notificationId);
    if (!rejectionNotification) {
      throw errorObj({reason: `Notification ${notificationId} no longer exists!`});
    }
    const {orgId, inviteeEmail} = rejectionNotification;
    const userOrgDoc = await getUserOrgDoc(viewerId, orgId);
    requireOrgLeader(userOrgDoc);

    // VALIDATION
    const {data: {reason}, errors} = rejectOrgApprovalValidation()(args);
    handleSchemaErrors(errors);

    // RESOLUTION
    const deniedByName = await r.table('User').get(viewerId)('preferredName').default('A Billing Leader');

    const {removeOrgApp, teamsInOrg} = await promiseAllObj({
      removeOrgApp: removeOrgApprovalAndNotification(orgId, inviteeEmail, {deniedBy: viewerId}),
      teamsInOrg: getActiveTeamsByOrgId(orgId, dataLoader)
    });
    const teamIdsInOrg = teamsInOrg.map(({id}) => id);
    const softTeamMembersInOrg = await getActiveSoftTeamMembersByEmail(inviteeEmail, teamIdsInOrg, dataLoader);
    await Promise.all(softTeamMembersInOrg.map(({email, teamId}) => removeSoftTeamMember(email, teamId, dataLoader)));
    const softTeamMemberIdsInOrg = softTeamMembersInOrg.map(({id}) => id);
    const softTasksInOrg = await getTasksByAssigneeIds(softTeamMemberIdsInOrg, dataLoader);
    const archivedSoftTasks = await archiveTasksForDB(softTasksInOrg, dataLoader);
    const archivedSoftTaskIds = archivedSoftTasks.map(({id}) => id);

    const {removedOrgApprovals, removedRequestNotifications} = removeOrgApp;
    const deniedNotifications = removedRequestNotifications.map(({inviterUserId}) => ({
      id: shortid.generate(),
      type: DENY_NEW_USER,
      startAt: now,
      orgId,
      userIds: [inviterUserId],
      reason,
      deniedByName,
      inviteeEmail
    }));
    await r.table('Notification').insert(deniedNotifications);
    const removedOrgApprovalIds = removedOrgApprovals.map(({id}) => id);
    const data = {
      deniedNotificationIds: deniedNotifications.map(({id}) => id),
      removedOrgApprovalIds,
      removedRequestNotifications,
      softTeamMemberIds: softTeamMemberIdsInOrg,
      archivedSoftTaskIds
    };

    const teamIds = Array.from(new Set(removedOrgApprovals.map(({teamId}) => teamId)));
    teamIds.forEach((teamId) => {
      const teamData = {...data, teamId};
      publish(ORG_APPROVAL, teamId, RejectOrgApprovalPayload, teamData, subOptions);
      publish(TEAM_MEMBER, teamId, RejectOrgApprovalPayload, teamData, subOptions);
    });

    // publish the archived soft tasks
    if (archivedSoftTaskIds.length > 0) {
      const teamMembers = await getActiveTeamMembersByTeamIds(teamIds, dataLoader);
      const userIdsOnTeams = Array.from(new Set(teamMembers.map(({userId}) => userId)));
      userIdsOnTeams.forEach((userId) => {
        publish(TASK, userId, RejectOrgApprovalPayload, data, subOptions);
      });
    }
    // publish all notifications
    removedRequestNotifications.concat(deniedNotifications).forEach((notification) => {
      const {userIds} = notification;
      userIds.forEach((userId) => {
        publish(NOTIFICATION, userId, RejectOrgApprovalPayload, data, subOptions);
      });
    });

    return data;
  }
};
