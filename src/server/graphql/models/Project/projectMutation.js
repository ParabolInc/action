import getRethink from 'server/database/rethinkDriver';
import {CreateProjectInput, UpdateProjectInput} from './projectSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString,
  GraphQLID
} from 'graphql';
import {requireSUOrTeamMember} from '../authorization';
import shortid from 'shortid';
import ms from 'ms';

const DEBOUNCE_TIME = ms('5m');

export default {
  updateProject: {
    type: GraphQLBoolean,
    description: 'Update a project with a change in content, ownership, or status',
    args: {
      updatedProject: {
        type: new GraphQLNonNull(UpdateProjectInput),
        description: 'the updated project including the id, and at least one other field'
      },
      rebalance: {
        type: GraphQLString,
        description: 'the name of a status if the sort order got so out of whack that we need to reset the btree'
      }
    },
    async resolve(source, {updatedProject, rebalance}, {authToken}) {
      const r = getRethink();
      const {id: projectId, teamSort, userSort, agendaId, isArchived, ...historicalProject} = updatedProject;
      // projectId is of format 'teamId::taskId'
      const [teamId] = projectId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const now = new Date();
      const mergeDoc = {
        ...historicalProject,
        updatedAt: now,
        projectId
      };
      const newProject = {
        ...historicalProject,
        agendaId,
        isArchived,
        teamSort,
        updatedAt: now,
        userSort
      };
      const {teamMemberId} = historicalProject;
      if (teamMemberId) {
        const [userId] = teamMemberId.split('::');
        newProject.userId = userId;
      }
      const projectUpdatePromise = r.table('Project').get(projectId).update(newProject);
      const dbWork = [projectUpdatePromise];
      // if this is just a sort update, don't bother writing to the history
      if (Object.keys(updatedProject).length === 2 && (teamSort !== undefined || userSort !== undefined)) {
        const projectHistoryPromise = r.table('ProjectHistory')
          .between([projectId, r.minval], [projectId, r.maxval], {index: 'projectIdUpdatedAt'})
          .orderBy({index: 'projectIdUpdatedAt'})
          .nth(-1)
          .default({updatedAt: r.epochTime(0)})
          .do((lastDoc) => {
            return r.branch(
              lastDoc('updatedAt').gt(r.epochTime((now - DEBOUNCE_TIME) / 1000)),
              r.table('ProjectHistory').get(lastDoc('id')).update(mergeDoc),
              r.table('ProjectHistory').insert(lastDoc.merge(mergeDoc, {id: shortid.generate()}))
            );
          });
        dbWork.push(projectHistoryPromise);
      }
      if (rebalance) {
        const rebalanceField = teamSort !== undefined ? 'teamSort' : 'userSort';
        const rebalanceCountPromise = await r.table('Project')
          .getAll(teamId, {index: 'teamId'})
          .filter({status: rebalance})
          .orderBy(rebalanceField)('id');
        const updates = rebalanceCountPromise.map((id, idx) => ({id, idx}));
        const rebalanceUpdatePromise = r.expr(updates)
          .forEach((update) => {
            return r.table('Project')
              .get(update('id'))
              .update({[rebalanceField]: update('idx')});
          });
        dbWork.push(rebalanceUpdatePromise);
      }
      await Promise.all(dbWork);
      return true;
    }
  },
  createProject: {
    type: GraphQLBoolean,
    description: 'Create a new project, triggering a CreateCard for other viewers',
    args: {
      newProject: {
        type: new GraphQLNonNull(CreateProjectInput),
        description: 'The new project including an id, status, and type, and teamMemberId'
      }
    },
    async resolve(source, {newProject}, {authToken}) {
      const r = getRethink();
      const {id} = newProject;
      // format of id is teamId::taskIdPart
      const [teamId] = id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const now = new Date();
      const [userId] = newProject.teamMemberId.split('::');
      const project = {
        ...newProject,
        isArchived: false,
        userId,
        createdAt: now,
        createdBy: authToken.sub,
        teamId,
        updatedAt: now
      };
      await r.table('Project').insert(project)
        .do(() => {
          return r.table('ProjectHistory').insert({
            id: shortid.generate(),
            content: project.content,
            projectId: project.id,
            status: project.status,
            teamMemberId: project.teamMemberId,
            updatedAt: project.updatedAt
          });
        });
    }
  },
  deleteProject: {
    type: GraphQLBoolean,
    description: 'Delete (not archive!) a project',
    args: {
      projectId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The projectId (teamId::shortid) to delete'
      }
    },
    async resolve(source, {projectId}, {authToken}) {
      const r = getRethink();
      // format of id is teamId::taskIdPart
      const [teamId] = projectId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      await r.table('Project').get(projectId).delete()
        .do(() => {
          return r.table('ProjectHistory')
            .between([projectId, r.minval], [projectId, r.maxval], {index: 'projectIdUpdatedAt'})
            .delete();
        });
    }
  },
  makeAction: {
    type: GraphQLBoolean,
    description: 'Turn a project into an action',
    args: {
      projectId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The projectId (teamId::shortid) to delete'
      }
    },
    async resolve(source, {projectId}, {authToken}) {
      const r = getRethink();
      // format of id is teamId::taskIdPart
      const [teamId] = projectId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const project = await r.table('Project').get(projectId);
      const now = new Date();
      const [userId] = project.teamMemberId.split('::');
      const newAction = {
        id: projectId,
        content: project.content,
        userId,
        teamMemberId: project.teamMemberId,
        isComplete: false,
        createdAt: project.createdAt,
        updatedAt: now,
        sortOrder: 0,
        agendaId: project.agendaId
      };
      await r.table('Action').insert(newAction)
        .do(() => {
          return r.table('Project').get(projectId).delete();
        });
    }
  }
};
