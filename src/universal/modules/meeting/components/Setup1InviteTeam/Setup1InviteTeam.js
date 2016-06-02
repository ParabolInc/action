import React, { Component, PropTypes } from 'react';
import { HotKeys } from 'react-hotkeys';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupField from '../../components/SetupField/SetupField';
import SetupHeader from '../../components/SetupHeader/SetupHeader';
import {
  NAVIGATE_SETUP_2_INVITE_TEAM,
  addInvitesFromInvitesField,
  updateInvitesField
} from '../../ducks/meeting.js';

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup1InviteTeam extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    uiState: PropTypes.object.isRequired
  }

  componentDidUpdate() {
    const { dispatch, uiState } = this.props;

    const emailLength = uiState.setup1.emails.length;

    if (emailLength > 0) {
      dispatch({ type: NAVIGATE_SETUP_2_INVITE_TEAM });
    }
  }

  render() {
    const { dispatch, uiState } = this.props;

    const invitesFieldHasValue = uiState.setup1.invitesFieldHasValue;
    const invitesFieldHasError = uiState.setup1.invitesFieldHasError;

    const onChangeInvites = (event) => {
      event.preventDefault();
      dispatch(updateInvitesField(event.target.value));
    };

    const onSubmitInvites = (event, emails) => {
      event.preventDefault();
      dispatch(addInvitesFromInvitesField(emails));
    };

    const handleSubmitInvites = (event) => {
      onSubmitInvites(event, uiState.setup1.invitesField);
    };

    const helpText = invitesFieldHasError ?
      // eslint-disable-next-line max-len
      <span>Oops! Please make sure email addresses are valid <br />and separated by a single comma.</span> :
      <span>You can paste multiple emails separated by a comma.<br />&nbsp;</span>;

    return (
      <SetupContent>
        <ProgressDots
          numDots={3}
          numCompleted={2}
          currentDot={2}
        />
        <SetupHeader
          heading="Invite team members"
          subHeading={<span>Who will be joining you?</span>}
        />
        <HotKeys handlers={{ keyEnter: handleSubmitInvites }}>
          <SetupField
            buttonDisabled={!invitesFieldHasValue}
            buttonIcon="check-circle"
            hasButton
            hasErrorText={invitesFieldHasError}
            hasHelpText
            helpText={helpText}
            type="text"
            isLarger
            isWider
            onButtonClick={handleSubmitInvites}
            onChange={onChangeInvites}
            placeholder="b.bunny@acme.co, d.duck@acme.co, e.fudd@acme.co"
            value={uiState.setup1.invitesField}
          />
        </HotKeys>
      </SetupContent>
    );
  }
}
