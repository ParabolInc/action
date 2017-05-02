import PropTypes from 'prop-types';
import React, { Component } from 'react'; // eslint-disable-line no-unused-vars
import {withRouter} from 'react-router-dom';
import signout from './signout';

@withRouter
export default class SignoutContainer extends Component {
  static contextTypes = {
    store: PropTypes.object
  };

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired
  };

  componentWillMount() {
    const {store: {dispatch}} = this.context;
    const {history} = this.props;
    signout(dispatch, history);
  }

  render() { return null; }
}
