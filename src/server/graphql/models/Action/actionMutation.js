import r from 'server/database/rethinkDriver';
import {CreateActionInput, UpdateActionInput} from './actionSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString,
  GraphQLID
} from 'graphql';
import {requireSUOrTeamMember} from '../authorization';
import rebalanceAction from './rebalanceAction';

export default {
  updateAction: {
    type: GraphQLBoolean,
    description: 'Update a action with a change in content, ownership, or status',
    args: {
      updatedAction: {
        type: new GraphQLNonNull(UpdateActionInput),
        description: 'the updated action including the id, and at least one other field'
      },
      rebalance: {
        type: GraphQLString,
        description: 'the name of a status if the sort order got so out of whack that we need to reset the btree'
      }
    },
    async resolve(source, {updatedAction, rebalance}, {authToken}) {
      const {id, ...action} = updatedAction;
      const [teamId] = id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const now = new Date();
      const newAction = {
        ...action,
        updatedAt: now
      };
      const {teamMemberId} = action;
      if (teamMemberId) {
        const [userId] = teamMemberId.split('::');
        newAction.userId = userId;
      }
      // we could possibly combine this into the rebalance if we did a resort on the server, but separate logic is nice
      await r.table('Action').get(id).update(newAction);
      if (rebalance) {
        await rebalanceAction(rebalance, teamId);
      }
      return true;
    }
  },
  createAction: {
    type: GraphQLBoolean,
    description: 'Create a new action, triggering a CreateCard for other viewers',
    args: {
      newAction: {
        type: new GraphQLNonNull(CreateActionInput),
        description: 'The new action including an id, teamMemberId, [agendaId], and sortOrder '
      }
    },
    async resolve(source, {newAction}, {authToken}) {
      const {id} = newAction;
      // format of id is teamId::taskIdPart
      const [teamId] = id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const now = new Date();
      const [userId] = newAction.teamMemberId.split('::');
      const action = {
        ...newAction,
        userId,
        createdAt: now,
        updatedAt: now,
        isComplete: false
      };
      await r.table('Action').insert(action);
    }
  },
  deleteAction: {
    type: GraphQLBoolean,
    description: 'Delete an action',
    args: {
      actionId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The actionId (teamId::shortid) to delete'
      }
    },
    async resolve(source, {actionId}, {authToken}) {
      // format of id is teamId::taskIdPart
      const [teamId] = actionId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      await r.table('Action').get(actionId).delete();
    }
  },
  makeProject: {
    type: GraphQLBoolean,
    description: 'Turn an action into a project',
    args: {
      actionId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The actionId (teamId::shortid) to delete'
      }
    },
    async resolve(source, {actionId}, {authToken}) {
      // format of id is teamId::taskIdPart
      const [teamId] = actionId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const action = await r.table('Action').get(actionId);
      const now = new Date();
      const newProject = {
        id: actionId,
        content: action.content,
        isArchived: false,
        teamId,
        teamMemberId: action.teamMemberId,
        createdAt: action.createdAt,
        updatedAt: now,
        status: 'active',
        teamSort: 0,
        userSort: 0,
        agendaId: action.agendaId
      };
      await r.table('Project').insert(newProject)
        .do(() => {
          return r.table('Action').get(actionId).delete();
        });
    }
  }
};
