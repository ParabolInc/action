import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';

const HelpTextMyRound = (props) => {
  const {styles, updateUserHasTasks} = props;
  const helpText = updateUserHasTasks ? 'Quick updates only, please.' : 'Add cards to track your current work.';
  return (
    <span className={css(styles.helpText)}>{`(Your turn to share. ${helpText})`}</span>
  );
};

HelpTextMyRound.propTypes = {
  styles: PropTypes.object,
  updateUserHasTasks: PropTypes.bool
};

const styleThunk = () => ({
  helpText: {
    fontWeight: 600,
    userSelect: 'none'
  }
});

export default withStyles(styleThunk)(HelpTextMyRound);
