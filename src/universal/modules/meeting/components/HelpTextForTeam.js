import {css} from 'aphrodite-local-styles/no-important';
import React from 'react';
import PropTypes from 'prop-types';
import {createFragmentContainer} from 'react-relay';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const HelpTextForTeam = (props) => {
  const {agendaInputRef, styles, currentTeamMember} = props;
  const handleAgendaControl = () => {
    agendaInputRef.focus();
  };
  const isCheckedInFalse = currentTeamMember.isCheckedIn === false;
  return (
    <span className={css(styles.helpText)}>
      <span>{isCheckedInFalse ? '(' : `(${currentTeamMember.preferredName} is sharing. `}</span>
      <span onClick={handleAgendaControl} className={css(styles.agendaControl)}>{'Add agenda items'}</span>
      {' for discussion.)'}
    </span>
  );
};

HelpTextForTeam.propTypes = {
  agendaInputRef: PropTypes.instanceOf(Element),
  styles: PropTypes.object,
  currentTeamMember: PropTypes.object.isRequired
};

const styleThunk = () => ({
  agendaControl: {
    color: ui.palette.warm,
    cursor: 'pointer',
    ':hover': {
      opacity: 0.5
    }
  },

  helpText: {
    fontWeight: 600,
    userSelect: 'none'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(HelpTextForTeam),
  graphql`
    fragment HelpTextForTeam_currentTeamMember on TeamMember {
      preferredName
      isCheckedIn
    }`
);
