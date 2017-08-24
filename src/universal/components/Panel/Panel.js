import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {cardBorderTop} from 'universal/styles/helpers';

const Panel = (props) => {
  const {
    children,
    controls,
    hasHeader,
    hideFirstRowBorder,
    label,
    styles
  } = props;

  return (
    <div className={css(styles.panel)}>
      {hasHeader &&
        <div className={css(styles.header)}>
          <div className={css(styles.label)}>
            {label}
          </div>
          <div className={css(styles.controls)}>
            {controls}
          </div>
        </div>
      }
      {/*
          NOTE: “hideFirstRowBorder”
          children may only be a set of rows,
          and in the absense of a panel header,
          we may want to avoid fuzzies by hiding
          the first row’s top border
      */}
      <div className={css(styles.children, hideFirstRowBorder && styles.hideFirstRowBorder)}>
        {children}
      </div>
    </div>
  );
};

Panel.propTypes = {
  children: PropTypes.any,
  controls: PropTypes.any,
  hasHeader: PropTypes.bool,
  hideFirstRowBorder: PropTypes.bool,
  label: PropTypes.any,
  styles: PropTypes.object
};

Panel.defaultProps = {
  hasHeader: true,
  label: 'Panel'
};

const styleThunk = () => ({
  panel: {
    backgroundColor: '#fff',
    border: `1px solid ${ui.panelBorderColor}`,
    borderRadius: ui.cardBorderRadius,
    display: 'flex',
    flexDirection: 'column',
    fontSize: appTheme.typography.s3,
    lineHeight: appTheme.typography.s5,
    margin: `${ui.panelMarginVertical} 0`,
    paddingTop: '.1875rem',
    position: 'relative',
    width: '100%',

    '::after': {
      ...cardBorderTop,
      color: appTheme.palette.mid40l
    }
  },

  header: {
    alignItems: 'center',
    display: 'flex'
  },

  label: {
    color: appTheme.palette.dark,
    fontWeight: 700,
    padding: `.75rem ${ui.panelGutter}`,
    textTransform: 'uppercase'
  },

  controls: {
    display: 'flex',
    flex: 1,
    height: '2.75rem',
    justifyContent: 'flex-end',
    lineHeight: '2.75rem',
    paddingRight: ui.panelGutter
  },

  children: {
    display: 'block',
    width: '100%'
  },

  hideFirstRowBorder: {
    marginTop: '-.0625rem'
  }
});

export default withStyles(styleThunk)(Panel);
