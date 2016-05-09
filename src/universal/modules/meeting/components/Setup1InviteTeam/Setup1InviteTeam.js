import React, { Component, PropTypes } from 'react';
import AdvanceLink from '../../components/AdvanceLink/AdvanceLink';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupField from '../../components/SetupField/SetupField';
import SetupHeader from '../../components/SetupHeader/SetupHeader';
import { NAVIGATE_SETUP_2_INVITE_TEAM } from '../../ducks/meeting.js';

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup1InviteTeam extends Component {
  static propTypes = {
    dispatch: PropTypes.func
  }
  render() {
    const { dispatch } = this.props;

    const onLinkClick = (event) => {
      event.preventDefault();
      dispatch({ type: NAVIGATE_SETUP_2_INVITE_TEAM });
    };

    return (
      <SetupContent>
        <ProgressDots
          numDots={3}
          numCompleted={1}
          currentDot={1}
        />
        <SetupHeader
          heading="Invite team members"
          subHeading={<span>Who will be joining you?</span>}
        />
        <SetupField
          buttonIcon="check-circle"
          hasButton
          hasHelpText
          helpText="*You can paste a comma-separated string of multiple emails."
          type="text"
          isLarger
          isWider
          onButtonClick={() => console.log('SetupField.onButtonClick')}
          onFocus={() => console.log('SetupField.onFocus')}
          placeholder="Search users or invite by email*"
        />
        <AdvanceLink
          onClick={onLinkClick}
          icon="arrow-circle-right"
          label="Carry on!"
        />
      </SetupContent>
    );
  }
}
