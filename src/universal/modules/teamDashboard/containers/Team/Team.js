import React, {PropTypes} from 'react';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import subscriptions from 'universal/subscriptions/subscriptions';
import {PROJECTS, TEAM, TEAM_MEMBERS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';
import {connect} from 'react-redux';

const teamMembersSubString = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;
const teamSubString = subscriptions.find(sub => sub.channel === TEAM).string;
const projectSubString = subscriptions.find(sub => sub.channel === PROJECTS).string;

const makeProjectSubs = (teamMembers) => {
  const projectSubs = [];
  for (let i = 0; i < teamMembers.length; i++) {
    const teamMemberId = teamMembers[i].id;
    projectSubs[i] = cashay.subscribe(projectSubString, subscriber, {
      op: 'projectSub',
      key: teamMemberId,
      variables: {teamMemberId}
    });
  }
  return projectSubs;
};

const makeTeamSubs = (teams) => {
  const teamSubs = {};
  for (let i = 0; i < teams.length; i++) {
    const teamId = teams[i];
    teamSubs[teamId] = cashay.subscribe(teamSubString, subscriber, {
      op: 'teamSub',
      key: teamId,
      variables: {teamId}
    });
  }
  return teamSubs;
};

// This should be cached, rather than do it ourselves, let's make cashay better so we can cache it there
const makeActiveMeetings = (teamIds, teamSubs) => {
  const activeMeetings = [];
  for (let i = 0; i < teamIds.length; i++) {
    const teamId = teamIds[i];
    const {team} = teamSubs[teamId].data;
    if (team.meetingId) {
      activeMeetings.push({
        link: `/meeting/${teamId}`,
        name: team.name
      });
    }
  }
  return activeMeetings;
};

// TODO memoize the map
const mapStateToProps = (state, props) => {
  const variables = {teamId: props.params.teamId};
  const memberSub = cashay.subscribe(teamMembersSubString, subscriber, {op: 'memberSub', variables});
  const projectSubs = makeProjectSubs(memberSub.data.teamMembers);
  const {focus} = state.editing;
  const {tms} = state.auth.obj;
  const teamSubs = makeTeamSubs(tms);
  return {
    memberSub,
    focus,
    projectSubs,
    teamSubs,
    tms
  };
};

const TeamContainer = (props) => {
  const {
    memberSub,
    focus,
    presenceSub,
    projectSubs,
    teamSubs,
    params: {teamId},
    tms,
    user,
    dispatch
  } = props;
  const editing = {
    current: presenceSub.data.editing,
    focus,
  };
  const {team} = teamSubs[teamId].data;
  const {teamMembers} = memberSub.data;
  const projects = [].concat(...projectSubs.map(sub => sub.data.projects));
  const activeMeetings = makeActiveMeetings(tms, teamSubs);
  return (
    <Team
      activeMeetings={activeMeetings}
      editing={editing}
      projects={projects}
      teamId={teamId}
      team={team}
      teamMembers={teamMembers}
      user={user}
      dispatch={dispatch}
    />
  );
};

TeamContainer.propTypes = {
  dispatch: PropTypes.func,
  params: PropTypes.shape({
    teamId: PropTypes.string.isRequired
  }),
  user: PropTypes.object,
  memberSub: PropTypes.object,
  focus: PropTypes.string,
  presenceSub: PropTypes.object.isRequired,
  projectSubs: PropTypes.array,
  teamSubs: PropTypes.object,
  tms: PropTypes.array
};

export default requireAuth(
  connect(mapStateToProps)(
    socketWithPresence(TeamContainer)
  )
);
