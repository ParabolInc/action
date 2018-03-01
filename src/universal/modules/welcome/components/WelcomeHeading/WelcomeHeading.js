import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const WelcomeHeading = (props) => {
  const {copy, styles} = props;
  return (
    <h2 className={css(styles.root)}>
      {copy}
    </h2>
  );
};
WelcomeHeading.propTypes = {
  copy: PropTypes.object,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    color: appTheme.palette.dark,
    display: 'block',
    fontSize: appTheme.typography.s6,
    fontWeight: 600,
    textAlign: 'center'
  }
});

export default withStyles(styleThunk)(WelcomeHeading);
