import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import CreateGitHubIssueMutation from 'universal/mutations/CreateGitHubIssueMutation';
import {MEETING} from 'universal/utils/constants';
import convertToTaskContent from 'universal/utils/draftjs/convertToTaskContent';
import MenuItemWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuItemWithShortcuts';
import MenuWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuWithShortcuts';

class GitHubRepoListMenu extends Component {
  static propTypes = {
    area: PropTypes.string.isRequired,
    handleAddTask: PropTypes.func,
    viewer: PropTypes.object.isRequired,
    relay: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    closePortal: PropTypes.func.isRequired,
    taskId: PropTypes.string.isRequired,
    setError: PropTypes.func.isRequired,
    clearError: PropTypes.func.isRequired,
    teamId: PropTypes.string.isRequired
  }

  componentWillMount() {
    const {viewer: {githubRepos}} = this.props;
    this.filterRepos(githubRepos);
  }

  componentWillReceiveProps(nextProps) {
    const {viewer: {githubRepos}} = nextProps;
    if (githubRepos !== this.props.viewer.githubRepos) {
      this.filterRepos(githubRepos);
    }
  }

  filterRepos(githubRepos) {
    const {relay: {environment}} = this.props;
    const {userId} = environment;
    const filteredRepos = githubRepos.filter((repo) => repo.userIds.includes(userId));
    // technically, someone could leave all integrations but still be integrated.
    this.filteredRepos = filteredRepos.length === 0 ? githubRepos : filteredRepos;
  }

  render() {
    const {area, handleAddTask, relay: {environment}, history, closePortal, taskId, setError, clearError, teamId} = this.props;
    if (this.filteredRepos.length === 0) {
      const inMeeting = area === MEETING;
      const handleClick = inMeeting ?
        handleAddTask(convertToTaskContent('#private Connect my GitHub account in Team Settings after the meeting')) :
        () => history.push(`/team/${teamId}/settings/integrations/github`);
      const label = inMeeting ? 'No repos! Remind me to set up GitHub' : 'Add your first GitHub repo';
      return (
        <MenuWithShortcuts
          ariaLabel={'Link your GitHub Account'}
          closePortal={closePortal}
        >
          <MenuItemWithShortcuts
            label={label}
            onClick={handleClick}
          />
        </MenuWithShortcuts>
      );
    }
    return (
      <MenuWithShortcuts
        ariaLabel={'Select an associated GitHub Repository'}
        closePortal={closePortal}
      >
        {this.filteredRepos.map((repo) => {
          const {nameWithOwner} = repo;
          return (
            <MenuItemWithShortcuts
              key={`githubReposMenItem${nameWithOwner}`}
              label={nameWithOwner}
              onClick={() => CreateGitHubIssueMutation(environment, nameWithOwner, taskId, setError, clearError)}
            />
          );
        })}
      </MenuWithShortcuts>
    );
  }
}

GitHubRepoListMenu.propTypes = {};

export default createFragmentContainer(
  withRouter(GitHubRepoListMenu),
  graphql`
    fragment GitHubRepoListMenu_viewer on User {
      githubRepos(teamId: $teamId) {
        nameWithOwner
        userIds
      }
    }
  `
);
