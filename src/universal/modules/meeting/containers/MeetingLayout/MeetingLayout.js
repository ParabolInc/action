import React, {Component, PropTypes} from 'react';
import Helmet from 'react-helmet';
import look, { StyleSheet } from 'react-look';
import theme from '../../../../theme/variables/theme';
import {connect} from 'react-redux';
import MeetingHeader from '../../components/MeetingHeader/MeetingHeader';
import MeetingNavbar from '../../components/MeetingNavbar/MeetingNavbar';
import MeetingSection from '../../components/MeetingSection/MeetingSection';
import UserInput from '../../components/UserInput/UserInput';
import {ensureState} from 'redux-optimistic-ui';
import {reduxSocket} from 'redux-socket-cluster';
import {localStorageVars} from 'universal/utils/clientOptions';
import {loadMeeting, updateEditing, updateContent} from '../../ducks/meeting';
import {push} from 'react-router-redux';
import ensureMeetingId from '../../decorators/ensureMeetingId/ensureMeetingId';

const exampleSections = [
  {
    id: 0,
    active: false,
    position: 'I.',
    heading: 'Check-In',
    description: 'The facilitator announces, “check-in round!” and asks each participant, “what’s on your mind that might keep you from being fully present?”'
  },
  {
    id: 1,
    active: true,
    position: 'II.',
    heading: 'Project Updates',
    description: 'For each project, the owner gives an update only on what’s changed since last meeting. New agenda items can be added by anyone.'
  },
  {
    id: 2,
    active: false,
    position: 'III.',
    heading: 'Agenda',
    description: 'Process each agenda item into new projects and actions. Assign items using @Mentions. Remember: an action can be completed quickly, while a project may live for multiple Action meetings until it’s completed.'
  }
];

const exampleInput = {
  active: false,
  activeLabelMessage: '@User is editing',
  placeholder: 'Type something here',
  type: 'text',
  value: ''
};

const exampleInputActive = {
  ...exampleInput,
  active: true,
  value: 'Somebody is typing here…'
};

const mapStateToProps = state => {
  state = ensureState(state);
  const auth = state.get('auth');
  const meeting = state.get('meeting');
  return {
    meeting: meeting && meeting.toJS(),
    userId: auth.getIn(['user', 'id']),
    socketState: state.getIn(['socket', 'socketState']),
    socketSubs: state.getIn(['socket', 'subs']).toJS(),
    socketId: state.getIn(['socket', 'id']),
    isAuthenticated: auth.get('isAuthenticated')
  };
}

const socketClusterListeners = {
  unsubscribe(props) {
    const {meeting, socketId, dispatch} = props;
    dispatch(updateEditing(meeting.instance.id, socketId, false));
  }
}
@reduxSocket({authTokenName: localStorageVars.authTokenName})
@connect(mapStateToProps)
@ensureMeetingId // catch for those who just landed at this url
@look
export default class MeetingLayout extends Component {
  constructor(props) {
    super(props);
    const {dispatch, socketSubs, socketId, meeting} = props;

    // TODO lock it down? invite only, password, etc.
    if (!socketSubs.length) {
      // TODO this is ugly, but we'll have to use this until i finish building Cashay
      dispatch(loadMeeting(meeting.instance.id));
    }
  }

  render() {
    const {meeting: {instance}, dispatch} = this.props;
    const {content, currentEditors} = instance;
    console.log('instance', instance);
    const isActive = Boolean(currentEditors.length);
    console.log('currentEditors', currentEditors)
    const handleOnLeaveMeetingClick = () => {
      dispatch(push('/'));
      console.log('handleOnLeaveMeetingClick');
    };

    const handleUserInputFocus = () => {
      const {meeting, socketId} = this.props;
      dispatch(updateEditing(meeting.instance.id, socketId, true));
    };

    const handleUserInputBlur = () => {
      const {meeting, socketId} = this.props;
      console.log('blur')
      dispatch(updateEditing(meeting.instance.id, socketId, false));
    };

    const handleUserInputChange = (event) => {
      const {meeting, socketId} = this.props;
      dispatch(updateContent(meeting.instance.id, event.target.value, socketId));
    };

    const handleUserInputChangeMocked = () => {
      console.log('handleUserInputChangeMocked');
    };

    const handleOnMeetingNameChange = () => {
      console.log('handleOnMeetingNameChange');
    };

    const exampleMeetingName = 'Core Action Meeting';
    return (
      <div className={styles.root}>
        <Helmet title={exampleMeetingName}/>
        <MeetingNavbar onLeaveMeetingClick={handleOnLeaveMeetingClick}/>
        <div className={styles.main}>
          <MeetingHeader onMeetingNameChange={handleOnMeetingNameChange} meetingName={exampleMeetingName}/>
          <MeetingSection {...exampleSections[0]} key={exampleSections[0].id}>
            <UserInput {...exampleInput}
              active={isActive}
              value={content}
              onUserInputChange={handleUserInputChange}
              onUserInputFocus={handleUserInputFocus}
              onUserInputBlur={handleUserInputBlur}
            />
          </MeetingSection>
          <MeetingSection {...exampleSections[1]} key={exampleSections[1].id}>
            <UserInput {...exampleInputActive} onUserInputChange={handleUserInputChangeMocked}/>
          </MeetingSection>
          <MeetingSection {...exampleSections[2]} key={exampleSections[2].id}>
            <UserInput {...exampleInput} onUserInputChange={handleUserInputChangeMocked}/>
          </MeetingSection>
        </div>
      </div>
    );

  }
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.c,
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    minHeight: '100vh',
    padding: 0,
    width: '100%'
  },

  main: {
    backgroundColor: '#fff',
    flex: 1,
    margin: '0 auto',
    maxWidth: '1440px',
    overflow: 'hidden',
    paddingLeft: '3rem',
    width: '100%',

    '@media screen and (min-width: 1280px)': {
      paddingLeft: '320px'
    }
  }

});
