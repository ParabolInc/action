import React, {PropTypes, Component} from 'react';
import Landing from 'universal/modules/landing/components/Landing/Landing';
import {connect} from 'react-redux';
import {ensureState} from 'redux-optimistic-ui';
import Helmet from 'react-helmet';
import {head, auth0} from 'universal/utils/clientOptions';
import {push} from 'react-router-redux';
import {loginUserError, loginAndRedirect} from 'universal/modules/auth/ducks/auth';

const mapStateToProps = state => ({
  isAuthenticated: ensureState(state).getIn(['auth', 'isAuthenticated']),
  meeting: ensureState(state).getIn(['meeting', 'instance'])
});

@connect(mapStateToProps)
export default class LandingContainer extends Component {
  static propTypes = {
    // children: PropTypes.element,
    isAuthenticated: PropTypes.bool.isRequired,
    meeting: PropTypes.shape({
      content: PropTypes.string,
      id: PropTypes.string
      // TODO what else?
    }),
    dispatch: PropTypes.func.isRequired
  };

  handleOnMeetingCreateClick = () => {
    const {isAuthenticated, meeting, dispatch} = this.props;
    if (isAuthenticated) {
      // TODO should meeting be persisted in localStorage?
      if (meeting && meeting.id) {
        dispatch(push(`/meeting/${meeting.id}`));
      } else {
        dispatch(push('/signin/create_team_and_meeting'));
      }
    } else {
      if (__CLIENT__) {
        // TODO handle auth0 css files in webpack build to make it work on server?
        const Auth0Lock = require('auth0-lock'); // eslint-disable-line global-require
        const {clientId, account} = auth0;
        const lock = new Auth0Lock(clientId, account);
        lock.show({
          authParams: {
            state: '/signin/create_team_and_meeting'
          }
        }, (error, profile, authToken) => {
          if (error) {
            return dispatch(loginUserError(error));
          }
          return dispatch(
            loginAndRedirect('/signin/create_team_and_meeting',
            authToken
          ));
        });
      }
    }
  }

  render() {
    return (
      <div>
        <Helmet title="Welcome to Action" {...head} />
        <Landing onMeetingCreateClick={this.handleOnMeetingCreateClick} {...this.props} />
      </div>
    );
  }
}
